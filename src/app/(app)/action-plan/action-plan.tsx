"use client";

import { useState } from "react";
import { CheckCircle2, Clock, ListTodo, Target } from "lucide-react";
import { NoAssessment } from "@/components/dashboard/no-assessment";
import { useCanEdit } from "@/components/session/session-provider";
import { MockBadge, PriorityBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Alert, EmptyState, ErrorState, LoadingState, ProgressBar } from "@/components/ui/feedback";
import { Select } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page";
import { StatCard } from "@/components/ui/stat-card";
import { ACTION_STATUS_LABEL, ActionStatusBadge } from "@/components/ui/status-badge";
import { Table, Td, Th } from "@/components/ui/table";
import { apiFetch, useApi } from "@/lib/api-client";
import type { ActionPlanData, ActionPlanItem, ActionStatus } from "@/lib/types";

const STATUSES = Object.keys(ACTION_STATUS_LABEL) as ActionStatus[];
const PROGRESS_STEPS = [0, 10, 25, 50, 75, 90, 100];

export function ActionPlan() {
  const { data, setData, loading, error, reload } = useApi<ActionPlanData>("/api/action-plan");
  const canEdit = useCanEdit();
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (loading) return <LoadingState label="Loading action plan…" />;
  if (error || !data) return <ErrorState message={error ?? "No data"} onRetry={reload} />;
  if (!data.assessmentId) {
    return (
      <>
        <PageHeader title="Action Plan" />
        <NoAssessment what="action plan" />
      </>
    );
  }

  const items = data.items;
  const done = items.filter((i) => i.status === "done").length;
  const inProgress = items.filter((i) => i.status === "in_progress").length;
  const overall = items.length ? Math.round(items.reduce((s, i) => s + i.progress, 0) / items.length) : 0;
  const phases = [...new Set(items.map((i) => i.phase))];

  async function update(item: ActionPlanItem, patch: Partial<Pick<ActionPlanItem, "status" | "progress">>) {
    setSaving(item.id);
    setSaveError(null);
    try {
      const updated = await apiFetch<ActionPlanItem>(`/api/action-plan/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setData((d) => d && { ...d, items: d.items.map((i) => (i.id === updated.id ? updated : i)) });
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Could not update");
    } finally {
      setSaving(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Action Plan"
        description="Prioritized steps to close your security gaps."
        actions={
          <>
            {data.isMock && <MockBadge />}
            <ButtonLink href="/insights" variant="outline">
              Add from AI Insights
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Overall Progress" value={`${overall}%`} icon={<Target className="size-6" />} footer={<ProgressBar value={overall} />} />
        <StatCard label="Total Actions" value={items.length} accent="violet" icon={<ListTodo className="size-6" />} />
        <StatCard label="In Progress" value={inProgress} accent="warning" icon={<Clock className="size-6" />} />
        <StatCard label="Completed" value={done} accent="success" icon={<CheckCircle2 className="size-6" />} />
      </div>

      {saveError && <Alert className="mt-4">{saveError}</Alert>}

      <Card className="mt-4">
        <CardHeader title="Actions" />
        <CardBody>
          {items.length === 0 ? (
            <EmptyState
              title="No actions yet"
              description="Add recommendations from AI Insights to build your plan."
              action={<ButtonLink href="/insights">Open AI Insights</ButtonLink>}
            />
          ) : (
            <Table className="min-w-[900px]">
              <thead>
                <tr>
                  <Th>Action</Th>
                  <Th>Priority</Th>
                  <Th>Responsible team</Th>
                  <Th>Est. cost</Th>
                  <Th>Phase</Th>
                  <Th>Status</Th>
                  <Th className="w-44">Progress</Th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={saving === item.id ? "opacity-60" : undefined}>
                    <Td>
                      <p className="font-medium text-fg">{item.title}</p>
                      {item.description && <p className="mt-0.5 text-xs text-muted">{item.description}</p>}
                    </Td>
                    <Td>
                      <PriorityBadge priority={item.priority} />
                    </Td>
                    <Td>{item.responsibleTeam}</Td>
                    <Td>{item.estimatedCost}</Td>
                    <Td className="whitespace-nowrap">{item.phase}</Td>
                    <Td>
                      {canEdit ? (
                        <Select
                          aria-label={`Status of ${item.title}`}
                          className="h-8 w-32"
                          value={item.status}
                          disabled={saving === item.id}
                          onChange={(e) => update(item, { status: e.target.value as ActionStatus })}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {ACTION_STATUS_LABEL[s]}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <ActionStatusBadge status={item.status} />
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={item.progress} />
                        {canEdit ? (
                          <Select
                            aria-label={`Progress of ${item.title}`}
                            className="h-8 w-20 px-2"
                            value={String(item.progress)}
                            disabled={saving === item.id}
                            onChange={(e) => update(item, { progress: Number(e.target.value) })}
                          >
                            {[...new Set([...PROGRESS_STEPS, item.progress])]
                              .sort((a, b) => a - b)
                              .map((p) => (
                                <option key={p} value={p}>
                                  {p}%
                                </option>
                              ))}
                          </Select>
                        ) : (
                          <span className="text-xs">{item.progress}%</span>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {phases.length > 0 && (
        <Card className="mt-4">
          <CardHeader title="Roadmap" description="Actions grouped by phase" />
          <CardBody>
            <ol className="grid gap-4 md:grid-cols-3">
              {phases.map((phase, i) => {
                const inPhase = items.filter((x) => x.phase === phase);
                const pct = Math.round(inPhase.reduce((s, x) => s + x.progress, 0) / inPhase.length);
                return (
                  <li key={phase} className="rounded-xl border border-line bg-surface-2 p-4">
                    <p className="text-xs text-subtle">Phase {i + 1}</p>
                    <p className="font-semibold">{phase}</p>
                    <ProgressBar className="mt-2" value={pct} />
                    <p className="mt-1 text-xs text-muted">
                      {pct}% · {inPhase.length} action{inPhase.length === 1 ? "" : "s"}
                    </p>
                  </li>
                );
              })}
            </ol>
          </CardBody>
        </Card>
      )}
    </>
  );
}
