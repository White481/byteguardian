import "server-only";
import type { z } from "zod";
import { HttpError } from "@/lib/api-response";
import { db } from "@/lib/db";
import type { ActionPlanData, ActionPlanItem, ActionStatus, Priority } from "@/lib/types";
import type { ActionItemInput, ActionItemUpdate } from "@/lib/validation";
import mock from "@data/mock/action-plan.mock.json";

/** Used when the AI service returns no actionPlan (mock mode) */
export function getMockActionPlan() {
  return (mock as ActionPlanItem[]).map(({ title, priority, responsibleTeam, estimatedCost, phase }) => ({
    title,
    priority,
    responsibleTeam,
    estimatedCost,
    phase,
  }));
}

/** Latest completed assessment of the company, or null */
export async function latestCompleted(companyId: string) {
  return db.assessment.findFirst({
    where: { companyId, status: "completed", result: { isNot: null } },
    orderBy: { completedAt: "desc" },
    include: { result: true },
  });
}

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

type Row = Awaited<ReturnType<typeof db.actionItem.findMany>>[number];

function toItem(r: Row): ActionPlanItem {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    priority: r.priority as Priority,
    responsibleTeam: r.responsibleTeam ?? "—",
    estimatedCost: r.estimatedCost ?? "—",
    phase: r.phase ?? "Unscheduled",
    status: r.status as ActionStatus,
    progress: r.progress,
  };
}

export async function getActionPlan(companyId: string): Promise<ActionPlanData> {
  const latest = await latestCompleted(companyId);
  if (!latest) return { assessmentId: null, isMock: false, items: [] };
  const rows = await db.actionItem.findMany({ where: { assessmentId: latest.id }, orderBy: { createdAt: "asc" } });
  const items = rows.map(toItem).sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  return { assessmentId: latest.id, isMock: latest.result?.source === "mock", items };
}

/** "Add to plan" from AI Insights, or a manual action */
export async function addActionItem(companyId: string, input: z.infer<typeof ActionItemInput>) {
  const latest = await latestCompleted(companyId);
  if (!latest) throw new HttpError(409, "NO_ASSESSMENT", "Complete an assessment first");
  const exists = await db.actionItem.findFirst({ where: { assessmentId: latest.id, title: input.title, priority: input.priority } });
  if (exists) throw new HttpError(409, "DUPLICATE", "This action is already in the plan");
  return toItem(await db.actionItem.create({ data: { assessmentId: latest.id, ...input } }));
}

export async function updateActionItem(companyId: string, id: string, input: z.infer<typeof ActionItemUpdate>) {
  const item = await db.actionItem.findFirst({ where: { id, assessment: { companyId } } });
  if (!item) throw new HttpError(404, "NOT_FOUND", "Action not found");

  // Keep status and progress consistent with each other
  let { status = item.status as ActionStatus, progress = item.progress } = input;
  if (input.status === "done") progress = 100;
  else if (input.status === "todo") progress = 0;
  else if (input.status === "in_progress" && (progress === 0 || progress === 100)) progress = 10;
  else if (input.progress !== undefined) status = progress >= 100 ? "done" : progress > 0 ? "in_progress" : "todo";

  return toItem(await db.actionItem.update({ where: { id }, data: { status, progress } }));
}
