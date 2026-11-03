import "server-only";
import type { AiInsights, DashboardData } from "@/lib/types";
import { latestCompleted } from "./action-plan";
import type { StoredScores } from "./scoring";

/** Dashboard data for the latest completed assessment, or null when there is none yet */
export async function getDashboard(companyId: string): Promise<DashboardData | null> {
  const a = await latestCompleted(companyId);
  if (!a?.result) return null;
  const scores = JSON.parse(a.result.scoresJson) as StoredScores;
  return {
    isMock: a.result.source === "mock",
    assessment: { id: a.id, completedAt: (a.completedAt ?? a.updatedAt).toISOString(), status: a.status },
    ...scores,
  };
}

/** Stored AI output for the latest completed assessment, or null */
export async function getLatestInsights(companyId: string): Promise<AiInsights | null> {
  const a = await latestCompleted(companyId);
  if (!a?.result?.aiInsights) return null;
  return JSON.parse(a.result.aiInsights) as AiInsights;
}
