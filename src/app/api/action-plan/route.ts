import { handle, readJson } from "@/lib/api-response";
import { ActionItemInput } from "@/lib/validation";
import { CAN_EDIT, requireCompanyUser, requireRole } from "@/server/auth";
import { addActionItem, getActionPlan } from "@/server/services/action-plan";

// GET /api/action-plan → ActionPlanData (latest completed assessment)
export async function GET() {
  return handle(async () => getActionPlan((await requireCompanyUser()).companyId));
}

// POST /api/action-plan { title, priority, ... } → ActionPlanItem ("Add to plan")
export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireCompanyUser();
    requireRole(user, CAN_EDIT);
    return addActionItem(user.companyId, ActionItemInput.parse(await readJson(req)));
  }, 201);
}
