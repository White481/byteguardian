import type { Metadata } from "next";
import { ActionPlan } from "./action-plan";

export const metadata: Metadata = { title: "Action Plan" };

// Figma frame "11 Action Plan"
export default function ActionPlanPage() {
  return <ActionPlan />;
}
