"use client";

import { useState } from "react";
import { Check, Lightbulb, Plus, Search, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { NoAssessment } from "@/components/dashboard/no-assessment";
import { useCanEdit } from "@/components/session/session-provider";
import { MockBadge, PriorityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Alert, EmptyState, ErrorState, LoadingState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page";
import { apiFetch, useApi } from "@/lib/api-client";
import type { AiInsights, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS: (Priority | "all")[] = ["all", "high", "medium", "low"];

export function Insights() {
  const { data, loading, error, reload } = useApi<AiInsights | null>("/api/insights");
  const canEdit = useCanEdit();
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [added, setAdded] = useState<Record<string, "adding" | "added">>({});
  const [actionError, setActionError] = useState<string | null>(null);

  if (loading) return <LoadingState label="Loading AI insights…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) {
    return (
      <>
        <PageHeader title="AI Insights" />
        <NoAssessment what="AI insights" />
      </>
    );
  }

  const recs = data.recommendations.filter((r) => priority === "all" || r.priority === priority);

  async function addToPlan(key: string, title: string, detail: string, p: Priority) {
    setActionError(null);
    setAdded((a) => ({ ...a, [key]: "adding" }));
    try {
      await apiFetch("/api/action-plan", {
        method: "POST",
        body: JSON.stringify({ title, description: detail, priority: p }),
      });
      setAdded((a) => ({ ...a, [key]: "added" }));
    } catch (e) {
      setAdded((a) => {
        const next = { ...a };
        delete next[key];
        return next;
      });
      setActionError(e instanceof Error ? e.message : "Could not add to plan");
    }
  }

  return (
    <>
      <PageHeader
        title="AI Insights"
        description="Findings and recommendations generated from your latest assessment."
        actions={data.isMock && <MockBadge label="Mock AI output" />}
      />

      {data.summary && (
        <Card className="mb-4">
          <CardHeader title="Executive Summary" icon={<Sparkles className="size-5" />} />
          <CardBody>
            <p className="text-sm leading-relaxed text-fg-soft">{data.summary}</p>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Recommendations"
            icon={<Lightbulb className="size-5" />}
            action={
              <div role="group" aria-label="Filter by priority" className="flex gap-1 rounded-lg bg-surface-2 p-1">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={priority === f}
                    onClick={() => setPriority(f)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs capitalize",
                      priority === f ? "bg-primary text-white" : "text-muted hover:text-fg",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            }
          />
          <CardBody className="flex flex-col gap-3">
            {actionError && <Alert>{actionError}</Alert>}
            {recs.length === 0 ? (
              <EmptyState title={`No ${priority} priority recommendations`} />
            ) : (
              recs.map((r) => {
                const key = `${r.title}|${r.detail}`;
                const state = added[key];
                return (
                  <div key={key} className="rounded-xl border border-line bg-surface-2 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-semibold">{r.title}</p>
                      <PriorityBadge priority={r.priority} />
                    </div>
                    <p className="mt-1 text-sm text-muted">{r.detail}</p>
                    {canEdit && (
                      <Button
                        size="sm"
                        variant={state === "added" ? "secondary" : "outline"}
                        className="mt-3"
                        loading={state === "adding"}
                        disabled={state === "added"}
                        onClick={() => addToPlan(key, r.title, r.detail, r.priority)}
                      >
                        {state === "added" ? <Check className="size-4" /> : <Plus className="size-4" />}
                        {state === "added" ? "Added to plan" : "Add to plan"}
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Key Findings" icon={<Search className="size-5" />} />
            <CardBody className="flex flex-col gap-2">
              {data.keyFindings.map((f, i) => (
                <div key={i} className="rounded-lg bg-surface-2 px-3 py-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium">{f.title}</span>
                    <PriorityBadge priority={f.priority} />
                  </div>
                  <p className="mt-1 text-xs text-muted">{f.detail}</p>
                </div>
              ))}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Security Gaps" icon={<ShieldAlert className="size-5" />} />
            <CardBody>
              <ul className="list-inside list-disc space-y-1 text-sm text-fg-soft">
                {data.weaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Suggested Improvements" icon={<TrendingUp className="size-5" />} />
            <CardBody>
              <ul className="list-inside list-disc space-y-1 text-sm text-fg-soft">
                {data.improvements.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
