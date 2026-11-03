import "server-only";
import type { DashboardData } from "@/lib/types";
import mock from "@data/mock/dashboard.mock.json";

/** What we store in AssessmentResult.scoresJson */
export type StoredScores = Omit<DashboardData, "isMock" | "assessment">;

/**
 * PENDING SPEC — data/templates/scoring.template.json.
 * Until the cyber team delivers the scoring rules, every assessment gets the mock scores,
 * stored with source "mock" so every page labels them as mock data.
 * When the rules arrive: compute StoredScores from the answers here; nothing else changes.
 */
export function scoreAssessment(): { scores: StoredScores; source: "mock" | "scoring-engine" } {
  const { summary, functionScores, categoryScores, risk } = mock as DashboardData;
  return { scores: { summary, functionScores, categoryScores, risk }, source: "mock" };
}
