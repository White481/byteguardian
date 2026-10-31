import { handle } from "@/lib/api-response";
import { getActionPlan } from "@/server/services/action-plan";

export async function GET() {
  return handle(() => getActionPlan());
}
