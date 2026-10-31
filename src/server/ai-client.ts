import "server-only";
import type { AiInsights } from "@/lib/types";
import mock from "@data/mock/insights.mock.json";

/**
 * The ONLY place the web app talks to the Data/AI team's service.
 *
 * - AI_API_URL empty  → returns mock insights (dev / demo)
 * - AI_API_URL set    → POSTs the assessment payload and returns the AI response
 *
 * Request/response shape: data/templates/ai-output.template.json (agree it with มุง/เพชร).
 * Runs on the server only, so AI_API_KEY never reaches the browser.
 */
export async function analyzeAssessment(payload: unknown): Promise<AiInsights> {
  const url = process.env.AI_API_URL;
  if (!url) return mock as AiInsights;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.AI_API_KEY ? { Authorization: `Bearer ${process.env.AI_API_KEY}` } : {}),
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`AI service error ${res.status}`);
  const data = (await res.json()) as Omit<AiInsights, "isMock">;
  return { ...data, isMock: false };
}
