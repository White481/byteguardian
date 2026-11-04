import { handle, readJson } from "@/lib/api-response";
import { db } from "@/lib/db";
import { ChatInput } from "@/lib/validation";
import { requireCompanyUser } from "@/server/auth";
import { chat } from "@/server/ai-client";
import { latestCompleted } from "@/server/services/action-plan";
import { rateLimit } from "@/server/rate-limit";

export const maxDuration = 90;

// POST /api/chat { messages } → ChatReply
export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireCompanyUser();
    rateLimit(`chat:${user.id}`, 20, 60 * 1000);
    const { messages } = ChatInput.parse(await readJson(req));
    const [latest, company] = await Promise.all([
      latestCompleted(user.companyId),
      db.company.findUniqueOrThrow({ where: { id: user.companyId } }),
    ]);
    const scores = latest?.result ? JSON.parse(latest.result.scoresJson) : null;
    const insights = latest?.result?.aiInsights ? JSON.parse(latest.result.aiInsights) : null;
    return chat({
      assessmentId: latest?.id ?? null,
      company: { industry: company.industry, companySize: company.companySize },
      messages,
      context: scores
        ? {
            summary: scores.summary,
            topRisks: scores.risk?.topRisks ?? [],
            recommendations: (insights?.recommendations ?? []).map((r: { title: string }) => r.title),
          }
        : null,
    });
  });
}
