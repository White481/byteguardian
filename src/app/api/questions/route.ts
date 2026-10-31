import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle } from "@/lib/api-response";
import { getQuestions } from "@/server/services/questions";

const Query = z.object({ type: z.enum(["full", "quick", "custom"]).default("full") });

// GET /api/questions?type=full|quick|custom
export async function GET(req: NextRequest) {
  return handle(async () => {
    const { type } = Query.parse({ type: req.nextUrl.searchParams.get("type") ?? undefined });
    return getQuestions(type);
  });
}
