import { handle, readJson } from "@/lib/api-response";
import { ActionItemUpdate } from "@/lib/validation";
import { CAN_EDIT, requireCompanyUser, requireRole } from "@/server/auth";
import { updateActionItem } from "@/server/services/action-plan";

// PATCH /api/action-plan/:id { status?, progress? } → ActionPlanItem
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireCompanyUser();
    requireRole(user, CAN_EDIT);
    return updateActionItem(user.companyId, (await params).id, ActionItemUpdate.parse(await readJson(req)));
  });
}
