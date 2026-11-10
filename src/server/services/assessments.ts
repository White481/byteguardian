import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { z } from "zod";
import { HttpError } from "@/lib/api-response";
import { db } from "@/lib/db";
import type {
  AnswerState,
  AnswerValue,
  AssessmentDetail,
  AssessmentStatus,
  AssessmentSummary,
  AssessmentType,
  Framework,
  FunctionCode,
  RiskLevel,
} from "@/lib/types";
import type { AnswerInput, CreateAssessmentInput } from "@/lib/validation";
import { analyzeAssessment } from "@/server/ai-client";
import { getMockActionPlan } from "./action-plan";
import { getQuestions } from "./questions";
import { scoreAssessment } from "./scoring";

const OPEN: AssessmentStatus[] = ["draft", "in_progress"];

const parseFunctions = (v: string | null) => (v ? (v.split(",") as FunctionCode[]) : undefined);

async function questionsFor(a: { type: string; functions: string | null }) {
  return getQuestions(a.type as AssessmentType, parseFunctions(a.functions));
}

/** Load an assessment that belongs to the company, or 404 (never reveal other companies' ids) */
async function findOwned(companyId: string, id: string) {
  const a = await db.assessment.findFirst({
    where: { id, companyId },
    include: { answers: { include: { evidence: true } }, result: true },
  });
  if (!a) throw new HttpError(404, "NOT_FOUND", "Assessment not found");
  return a;
}

type Loaded = Awaited<ReturnType<typeof findOwned>>;

async function toSummary(a: Omit<Loaded, "answers"> & { answers: { questionId: string }[] }): Promise<AssessmentSummary> {
  const questions = await questionsFor(a);
  const ids = new Set(questions.map((q) => q.id));
  return {
    id: a.id,
    type: a.type as AssessmentType,
    framework: a.framework as Framework,
    status: a.status as AssessmentStatus,
    startedAt: a.startedAt.toISOString(),
    submittedAt: a.submittedAt?.toISOString() ?? null,
    completedAt: a.completedAt?.toISOString() ?? null,
    answeredCount: a.answers.filter((x) => ids.has(x.questionId)).length,
    questionCount: questions.length,
    currentTier: a.result?.currentTier ?? null,
    riskLevel: (a.result?.riskLevel as RiskLevel | undefined) ?? null,
  };
}

export async function listAssessments(companyId: string): Promise<AssessmentSummary[]> {
  const rows = await db.assessment.findMany({
    where: { companyId },
    orderBy: { startedAt: "desc" },
    include: { answers: { select: { questionId: true } }, result: true },
  });
  return Promise.all(rows.map(toSummary));
}

export async function createAssessment(
  user: { id: string; companyId: string },
  input: z.infer<typeof CreateAssessmentInput>,
): Promise<AssessmentSummary> {
  if (input.framework !== "nist-csf-2") {
    throw new HttpError(422, "FRAMEWORK_UNAVAILABLE", "This framework's question set is not available yet");
  }
  if (input.type === "custom" && !input.functions?.length) {
    throw new HttpError(422, "VALIDATION_ERROR", "Choose at least one function for a custom assessment");
  }
  const created = await db.assessment.create({
    data: {
      companyId: user.companyId,
      createdById: user.id,
      type: input.type,
      framework: input.framework,
      functions: input.type === "custom" ? input.functions!.join(",") : null,
      status: "in_progress",
    },
    include: { answers: { select: { questionId: true } }, result: true },
  });
  return toSummary(created);
}

export async function getAssessment(companyId: string, id: string): Promise<AssessmentDetail> {
  const a = await findOwned(companyId, id);
  const answers: Record<string, AnswerState> = {};
  for (const ans of a.answers) {
    answers[ans.questionId] = {
      value: ans.value as AnswerValue,
      note: ans.note,
      evidence: ans.evidence.map((e) => ({ id: e.id, fileName: e.fileName })),
    };
  }
  return { ...(await toSummary(a)), currentIndex: a.currentIndex, questions: await questionsFor(a), answers };
}

export async function saveAnswer(companyId: string, id: string, input: z.infer<typeof AnswerInput>) {
  const a = await findOwned(companyId, id);
  if (!OPEN.includes(a.status as AssessmentStatus)) {
    throw new HttpError(409, "LOCKED", "This assessment was already submitted");
  }
  const questions = await questionsFor(a);
  if (!questions.some((q) => q.id === input.questionId)) {
    throw new HttpError(422, "UNKNOWN_QUESTION", "Question is not part of this assessment");
  }
  const note = input.note || null;
  await db.$transaction([
    db.answer.upsert({
      where: { assessmentId_questionId: { assessmentId: id, questionId: input.questionId } },
      create: { assessmentId: id, questionId: input.questionId, value: input.value, note },
      update: { value: input.value, note },
    }),
    db.assessment.update({
      where: { id },
      data: {
        status: "in_progress",
        ...(input.currentIndex !== undefined
          ? { currentIndex: Math.min(input.currentIndex, questions.length - 1) }
          : {}),
      },
    }),
  ]);
  return { saved: true };
}

export async function submitAssessment(companyId: string, id: string) {
  const a = await findOwned(companyId, id);
  if (!OPEN.includes(a.status as AssessmentStatus)) {
    throw new HttpError(409, "LOCKED", "This assessment was already submitted");
  }
  const questions = await questionsFor(a);
  const answered = new Set(a.answers.map((x) => x.questionId));
  const missing = questions.filter((q) => !answered.has(q.id));
  if (missing.length) {
    throw new HttpError(
      422,
      "INCOMPLETE",
      `Answer every question before submitting (${missing.length} left, e.g. ${missing[0].id})`,
    );
  }
  await db.assessment.update({ where: { id }, data: { status: "submitted", submittedAt: new Date() } });
  return { status: "submitted" as const };
}

/**
 * Score the answers, ask the AI service for insights and create the action plan.
 * Called by the Processing page; safe to retry after a failure.
 */
export async function processAssessment(companyId: string, id: string) {
  const a = await findOwned(companyId, id);
  if (a.status === "completed") return { status: "completed" as const };
  if (!["submitted", "processing", "failed"].includes(a.status)) {
    throw new HttpError(409, "NOT_SUBMITTED", "Submit the assessment first");
  }
  await db.assessment.update({ where: { id }, data: { status: "processing" } });

  try {
    const company = await db.company.findUniqueOrThrow({ where: { id: companyId } });
    const { scores, source } = scoreAssessment({
      answers: a.answers.map((x) => ({ questionId: x.questionId, value: x.value })),
      company: { industry: company.industry, companySize: company.companySize },
    });
    const insights = await analyzeAssessment({
      assessmentId: id,
      framework: a.framework,
      company: {
        industry: company.industry,
        companySize: company.companySize,
        employeeCount: company.employeeCount,
        annualRevenue: company.annualRevenue,
        country: company.country,
        itInfrastructure: company.itInfrastructure,
        cloudEnvironment: company.cloudEnvironment,
      },
      answers: a.answers.map((x) => ({ questionId: x.questionId, value: x.value, note: x.note })),
      scores: {
        currentTier: scores.summary.currentTier,
        targetTier: scores.summary.targetTier,
        functions: scores.functionScores.map(({ function: f, current, target }) => ({ function: f, current, target })),
        overallGap: scores.summary.overallGap,
        riskLevel: scores.summary.riskLevel,
      },
    });
    // The AI service may suggest a plan with its ML model; otherwise keep the rule-based one.
    if (insights.recommendedPlan?.plan) {
      scores.summary.recommendedPlan = insights.recommendedPlan.plan;
      scores.summary.recommendedPlanSource = "ml";
    }
    const plan = insights.actionPlan?.length ? insights.actionPlan : getMockActionPlan();
    const resultSource = source === "mock" || insights.isMock ? "mock" : "ai";
    const result = {
      currentTier: scores.summary.currentTier,
      targetTier: scores.summary.targetTier,
      riskLevel: scores.summary.riskLevel,
      scoresJson: JSON.stringify(scores),
      aiInsights: JSON.stringify(insights),
      source: resultSource,
    };

    await db.$transaction([
      db.assessmentResult.upsert({ where: { assessmentId: id }, create: { assessmentId: id, ...result }, update: result }),
      db.actionItem.deleteMany({ where: { assessmentId: id } }),
      db.actionItem.createMany({
        data: plan.map((p) => ({
          assessmentId: id,
          title: p.title,
          priority: p.priority,
          responsibleTeam: p.responsibleTeam,
          estimatedCost: p.estimatedCost,
          phase: p.phase,
        })),
      }),
      db.assessment.update({ where: { id }, data: { status: "completed", completedAt: new Date() } }),
    ]);
    return { status: "completed" as const };
  } catch (e) {
    await db.assessment.update({ where: { id }, data: { status: "failed" } });
    console.error("processAssessment failed", e);
    throw new HttpError(502, "PROCESSING_FAILED", "Analysis failed. Please try again.");
  }
}

export async function getStatus(companyId: string, id: string) {
  const a = await db.assessment.findFirst({ where: { id, companyId }, select: { status: true } });
  if (!a) throw new HttpError(404, "NOT_FOUND", "Assessment not found");
  return { status: a.status as AssessmentStatus };
}

// ---- Evidence upload ----

export const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);
// UPLOAD_DIR points at a persistent volume in production (e.g. /data/uploads on Railway)
const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

export async function addEvidence(companyId: string, id: string, questionId: string, file: File) {
  const a = await findOwned(companyId, id);
  if (!OPEN.includes(a.status as AssessmentStatus)) {
    throw new HttpError(409, "LOCKED", "This assessment was already submitted");
  }
  const answer = a.answers.find((x) => x.questionId === questionId);
  if (!answer) throw new HttpError(422, "NO_ANSWER", "Answer the question before attaching evidence");
  if (file.size === 0) throw new HttpError(422, "EMPTY_FILE", "The file is empty");
  if (file.size > MAX_EVIDENCE_BYTES) throw new HttpError(413, "FILE_TOO_LARGE", "Files must be 10 MB or smaller");
  if (!ALLOWED_MIME.has(file.type)) {
    throw new HttpError(415, "FILE_TYPE", "Upload a PDF, PNG, JPG, TXT, DOCX or XLSX file");
  }

  // Never use the user's file name in the path — store under a random key
  const ext = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, "").slice(0, 8);
  const storageKey = path.join(id, `${randomUUID()}${ext}`);
  await mkdir(path.join(UPLOAD_ROOT, id), { recursive: true });
  await writeFile(path.join(UPLOAD_ROOT, storageKey), Buffer.from(await file.arrayBuffer()));

  const fileName = file.name.replace(/[^\w.\- ()]/g, "_").slice(0, 200) || "evidence";
  const ev = await db.evidence.create({
    data: { answerId: answer.id, fileName, mimeType: file.type, sizeBytes: file.size, storageKey },
  });
  return { id: ev.id, fileName: ev.fileName };
}
