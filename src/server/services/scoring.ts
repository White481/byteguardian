import "server-only";
import type { AnswerValue, CategoryScore, DashboardData, FunctionCode, FunctionScore, RiskLevel } from "@/lib/types";
import questionSet from "@data/questions.json";
import rules from "@data/scoring.json";

/** What we store in AssessmentResult.scoresJson */
export type StoredScores = Omit<DashboardData, "isMock" | "assessment">;

/**
 * Scoring engine — implements data/scoring.json (DRAFT rules from the Data/AI team).
 * Reference implementation in Python: data-ai/scoring.py (keep both in sync).
 */

interface RawQuestion {
  id: string;
  function: string;
  category: string;
  categoryName: string;
  critical: boolean;
  cisIg: number;
}

type Impact = "high" | "medium" | "low";

const QUESTIONS = questionSet.questions as RawQuestion[];
const MAX_TIER = rules.maxTier;
const LEVELS: RiskLevel[] = ["low", "medium", "high", "critical"];
const FUNCTION_NAMES: Record<FunctionCode, string> = {
  GV: "Govern",
  ID: "Identify",
  PR: "Protect",
  DE: "Detect",
  RS: "Respond",
  RC: "Recover",
};
const IMPACT_WEIGHT: Record<Impact, number> = { high: 3, medium: 2, low: 1 };
const IMPACT_ROW: Record<Impact, number> = { high: 0, medium: 1, low: 2 };
const LIKELIHOOD_COL = { partially: 1, no: 2 } as const;
const ISSUE_LEVEL: Record<string, RiskLevel> = {
  "high+no": "critical",
  "high+partially": "high",
  "medium+no": "high",
  "medium+partially": "medium",
  "low+no": "medium",
  "low+partially": "low",
};

export interface ScoringInput {
  answers: { questionId: string; value: string }[];
  company: { industry: string | null; companySize: string | null };
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

function points(value: string): number {
  return rules.answerValues[value as AnswerValue] ?? 0;
}

function tierLabel(tier: number): string {
  const key = String(Math.max(1, Math.min(MAX_TIER, Math.floor(tier)))) as keyof typeof rules.tierLabels;
  return rules.tierLabels[key];
}

const isHighRisk = (industry: string | null) =>
  !!industry && (rules.targetTier.highRiskIndustries as string[]).includes(industry);

export function targetTierFor(industry: string | null, companySize: string | null): number {
  const bySize = rules.targetTier.baseBySize as Record<string, number>;
  // Unknown size → assume Medium
  const base = (companySize && bySize[companySize]) || bySize["Medium (51–250)"];
  return Math.min(base + (isHighRisk(industry) ? rules.targetTier.highRiskBonus : 0), MAX_TIER);
}

export function recommendedPlanFor(
  industry: string | null,
  companySize: string | null,
  riskLevel: RiskLevel,
  servicesRequested = 1,
): string {
  const p = rules.recommendedPlan;
  const sizePoints: number = (companySize ? (p.sizePoints as Record<string, number>)[companySize] : undefined) ?? 1;
  const need =
    sizePoints +
    (isHighRisk(industry) ? 1 : 0) +
    (p.riskPoints as Record<RiskLevel, number>)[riskLevel] +
    Math.min(1, 0.5 * Math.max(0, servicesRequested - 1));
  const internal = p.thresholds.find((t) => need <= t.maxNeedScore)!.plan;
  return planDisplayName(internal);
}

/** Internal plan label (CIS IG1/2/3) → the plan name we sell, from scoring.json "displayNames". */
export function planDisplayName(internal: string): string {
  return (rules.recommendedPlan.displayNames as Record<string, string>)[internal] ?? internal;
}

export function scoreAssessment({ answers, company }: ScoringInput): {
  scores: StoredScores;
  source: "mock" | "scoring-engine";
} {
  const byId = new Map(answers.map((a) => [a.questionId, a.value]));
  const qs = QUESTIONS.filter((q) => byId.has(q.id));
  if (!qs.length) throw new Error("No answers that match the question set");

  // Question → category → function → overall
  const catTiers = new Map<string, number[]>();
  for (const q of qs) {
    const t = 1 + 3 * points(byId.get(q.id)!);
    catTiers.set(q.category, [...(catTiers.get(q.category) ?? []), t]);
  }
  const categoryScores: CategoryScore[] = [...catTiers].map(([category, ts]) => ({
    category,
    name: qs.find((q) => q.category === category)!.categoryName,
    current: round1(avg(ts)),
  }));

  const fnTiers = new Map<FunctionCode, number[]>();
  for (const [category, ts] of catTiers) {
    const fn = qs.find((q) => q.category === category)!.function as FunctionCode;
    fnTiers.set(fn, [...(fnTiers.get(fn) ?? []), avg(ts)]);
  }
  const target = targetTierFor(company.industry, company.companySize);
  const fnScores = [...fnTiers].map(([fn, ts]) => ({ fn, score: avg(ts) }));
  const functionScores: FunctionScore[] = fnScores.map(({ fn, score }) => ({
    function: fn,
    name: FUNCTION_NAMES[fn],
    current: round1(score),
    target,
  }));

  const currentTier = round1(avg(fnScores.map((f) => f.score)));
  const overallGap = round1(avg(fnScores.map((f) => Math.max(0, target - f.score))));

  let riskLevel = rules.riskLevel.gapThresholds.find((t) => overallGap <= t.maxGap)!.level as RiskLevel;
  if (qs.some((q) => q.critical && byId.get(q.id) === "no")) {
    riskLevel = LEVELS[Math.min(LEVELS.indexOf(riskLevel) + 1, LEVELS.length - 1)];
  }

  // Issues → heatmap, counts, top risks, risk score
  const heatmap = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  const issues: { title: string; level: RiskLevel; impact: Impact }[] = [];
  let weighted = 0;
  let weights = 0;
  for (const q of qs) {
    const value = byId.get(q.id)!;
    const impact: Impact = q.critical || target >= 4 ? "high" : q.cisIg === 1 ? "medium" : "low";
    weighted += (1 - points(value)) * IMPACT_WEIGHT[impact];
    weights += IMPACT_WEIGHT[impact];
    if (value !== "no" && value !== "partially") continue;
    const level = ISSUE_LEVEL[`${impact}+${value}`];
    heatmap[IMPACT_ROW[impact]][LIKELIHOOD_COL[value]] += 1;
    counts[level as keyof typeof counts] += 1;
    issues.push({ title: q.categoryName, level, impact });
  }
  const topRisks = issues
    .sort((a, b) => LEVELS.indexOf(b.level) - LEVELS.indexOf(a.level) || IMPACT_WEIGHT[b.impact] - IMPACT_WEIGHT[a.impact])
    .slice(0, 4)
    .map(({ title, level }) => ({ title, level }));

  return {
    scores: {
      summary: {
        currentTier,
        currentTierLabel: tierLabel(currentTier),
        targetTier: target,
        targetTierLabel: tierLabel(target),
        overallGap,
        riskLevel,
        maxTier: MAX_TIER,
        recommendedPlan: recommendedPlanFor(company.industry, company.companySize, riskLevel),
        recommendedPlanSource: "rule",
      },
      functionScores,
      categoryScores,
      risk: {
        overallScore: Math.round((100 * weighted) / weights),
        counts,
        heatmap,
        topRisks,
      },
    },
    source: "scoring-engine",
  };
}
