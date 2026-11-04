import "server-only";
import type { AiInsights, ChatReply, ChatTurn } from "@/lib/types";
import mock from "@data/mock/insights.mock.json";

function authHeaders(): Record<string, string> {
  return process.env.AI_API_KEY ? { Authorization: `Bearer ${process.env.AI_API_KEY}` } : {};
}

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
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`AI service error ${res.status}`);
  const data = (await res.json()) as Omit<AiInsights, "isMock">;
  return { ...data, isMock: false };
}

export interface ChatRequest {
  assessmentId: string | null;
  company: { industry: string | null; companySize: string | null };
  messages: ChatTurn[];
  /** Latest results, so the AI service can answer questions about them without a database */
  context?: {
    summary: unknown;
    topRisks: unknown;
    recommendations: string[];
  } | null;
}

/**
 * AI assistant chat.
 * - AI_CHAT_URL empty → mock reply (dev / demo)
 * - AI_CHAT_URL set   → POSTs { assessmentId, company, messages } and expects { reply }
 *
 * Request/response shape: data/templates/chat.template.json (agree it with มุง/เพชร).
 */
export async function chat(payload: ChatRequest): Promise<ChatReply> {
  const url = process.env.AI_CHAT_URL;
  if (!url) {
    return {
      isMock: true,
      reply:
        "[MOCK] The AI assistant is not connected yet. When the Data/AI team provides the chat service, " +
        "set AI_CHAT_URL in .env and real answers will appear here.",
    };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`AI chat service error ${res.status}`);
  const data = (await res.json()) as { reply?: unknown };
  if (typeof data.reply !== "string") throw new Error("AI chat service returned no reply");
  return { reply: data.reply, isMock: false };
}
