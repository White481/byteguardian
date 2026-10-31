import "server-only";
import type { ActionPlanItem } from "@/lib/types";
import mock from "@data/mock/action-plan.mock.json";

/** TODO(พี่ภีม): read/write ActionItem rows in the DB */
export async function getActionPlan(): Promise<ActionPlanItem[]> {
  return mock as ActionPlanItem[];
}
