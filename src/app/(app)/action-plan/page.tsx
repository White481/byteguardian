import type { Metadata } from "next";
import { PageHeader, PagePlaceholder } from "@/components/ui/page";

export const metadata: Metadata = { title: "Action Plan" };

// Owner: พี่ภีม — Figma frame "11 Action Plan"
export default function ActionPlanPage() {
  return (
    <>
      <PageHeader title="Action Plan" description="Prioritized roadmap to reach your target tier." />
      <PagePlaceholder
        owner="พี่ภีม"
        reference='Figma frame "11 Action Plan"'
        todo={[
          "Load GET /api/action-plan",
          "Columns: action, priority, responsible team, estimated cost, phase, status, progress",
          "Update status/progress (PATCH) + overall progress cards + roadmap phases",
        ]}
      />
    </>
  );
}
