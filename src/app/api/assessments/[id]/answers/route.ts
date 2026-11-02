import { handle, readJson } from "@/lib/api-response";
import { AnswerInput } from "@/lib/validation";
import { CAN_EDIT, requireCompanyUser, requireRole } from "@/server/auth";
import { saveAnswer } from "@/server/services/assessments";

// PUT /api/assessments/:id/answers { questionId, value, note?, currentIndex? }
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireCompanyUser();
    requireRole(user, CAN_EDIT);
    return saveAnswer(user.companyId, (await params).id, AnswerInput.parse(await readJson(req)));
  });
}
