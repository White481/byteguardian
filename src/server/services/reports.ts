import "server-only";
import { HttpError } from "@/lib/api-response";
import { db } from "@/lib/db";
import type { ActionPlanItem, ActionStatus, AiInsights, DashboardData, Framework, Priority, ReportItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import type { StoredScores } from "./scoring";

export async function listReports(companyId: string): Promise<ReportItem[]> {
  const rows = await db.report.findMany({
    where: { assessment: { companyId } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    assessmentId: r.assessmentId,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function createReport(companyId: string, assessmentId: string): Promise<ReportItem> {
  const a = await db.assessment.findFirst({ where: { id: assessmentId, companyId, status: "completed" } });
  if (!a) throw new HttpError(404, "NOT_FOUND", "Completed assessment not found");
  const r = await db.report.create({
    data: { assessmentId, title: `Cybersecurity Maturity Report — ${formatDate(a.completedAt ?? a.updatedAt)}` },
  });
  return { id: r.id, title: r.title, assessmentId: r.assessmentId, createdAt: r.createdAt.toISOString() };
}

export interface ReportData {
  report: ReportItem;
  companyName: string;
  framework: Framework;
  dashboard: DashboardData;
  insights: AiInsights | null;
  actions: ActionPlanItem[];
}

/** Everything the printable report needs: scores, gaps, risk, AI insights and action plan */
export async function getReportData(companyId: string, reportId: string): Promise<ReportData | null> {
  const r = await db.report.findFirst({
    where: { id: reportId, assessment: { companyId } },
    include: { assessment: { include: { result: true, company: true, actionItems: true } } },
  });
  const a = r?.assessment;
  if (!r || !a?.result) return null;
  const scores = JSON.parse(a.result.scoresJson) as StoredScores;
  return {
    report: { id: r.id, title: r.title, assessmentId: a.id, createdAt: r.createdAt.toISOString() },
    companyName: a.company.name,
    framework: a.framework as Framework,
    dashboard: {
      isMock: a.result.source === "mock",
      assessment: { id: a.id, completedAt: (a.completedAt ?? a.updatedAt).toISOString(), status: a.status },
      ...scores,
    },
    insights: a.result.aiInsights ? (JSON.parse(a.result.aiInsights) as AiInsights) : null,
    actions: a.actionItems.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      priority: i.priority as Priority,
      responsibleTeam: i.responsibleTeam ?? "—",
      estimatedCost: i.estimatedCost ?? "—",
      phase: i.phase ?? "Unscheduled",
      status: i.status as ActionStatus,
      progress: i.progress,
    })),
  };
}
