import type { ActionStatus, AssessmentStatus } from "@/lib/types";
import { Badge } from "./badge";

const assessmentTone = {
  draft: "neutral",
  in_progress: "primary",
  submitted: "cyan",
  processing: "cyan",
  completed: "success",
  failed: "danger",
} as const;

const assessmentLabel: Record<AssessmentStatus, string> = {
  draft: "Draft",
  in_progress: "In progress",
  submitted: "Submitted",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

export function AssessmentStatusBadge({ status }: { status: AssessmentStatus }) {
  return <Badge tone={assessmentTone[status]}>{assessmentLabel[status]}</Badge>;
}

const actionTone = { todo: "neutral", in_progress: "primary", done: "success" } as const;
export const ACTION_STATUS_LABEL: Record<ActionStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export function ActionStatusBadge({ status }: { status: ActionStatus }) {
  return <Badge tone={actionTone[status]}>{ACTION_STATUS_LABEL[status]}</Badge>;
}
