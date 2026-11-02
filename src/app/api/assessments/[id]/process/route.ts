import { handle } from "@/lib/api-response";
import { CAN_EDIT, requireCompanyUser, requireRole } from "@/server/auth";
import { processAssessment } from "@/server/services/assessments";

// The AI call can take up to 60s
export const maxDuration = 90;

// POST /api/assessments/:id/process — scoring + AI analysis + action plan; retry-safe
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireCompanyUser();
    requireRole(user, CAN_EDIT);
    return processAssessment(user.companyId, (await params).id);
  });
}
