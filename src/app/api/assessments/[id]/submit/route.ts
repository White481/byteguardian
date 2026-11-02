import { handle } from "@/lib/api-response";
import { CAN_EDIT, requireCompanyUser, requireRole } from "@/server/auth";
import { submitAssessment } from "@/server/services/assessments";

// POST /api/assessments/:id/submit — fails with 422 if any question is unanswered
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireCompanyUser();
    requireRole(user, CAN_EDIT);
    return submitAssessment(user.companyId, (await params).id);
  });
}
