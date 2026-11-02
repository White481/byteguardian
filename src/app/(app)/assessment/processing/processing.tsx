"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Circle, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { apiFetch } from "@/lib/api-client";
import type { AssessmentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  "Answers submitted",
  "Calculating maturity scores",
  "Analyzing gaps with AI",
  "Building your action plan",
  "Preparing your dashboard",
];

/** Which step is active for a given status (the AI call is one long request, so steps 1–3 animate) */
function stepFor(status: AssessmentStatus | null, tick: number) {
  if (status === "completed") return STEPS.length;
  if (status === "processing") return Math.min(1 + Math.floor(tick / 2), STEPS.length - 1);
  return 1;
}

export function Processing() {
  const id = useSearchParams().get("id");
  const router = useRouter();
  const [status, setStatus] = useState<AssessmentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const started = useRef(false);

  const run = useCallback(async () => {
    if (!id) return;
    setError(null);
    setStatus("processing");
    setTick(0);
    try {
      const res = await apiFetch<{ status: AssessmentStatus }>(`/api/assessments/${id}/process`, { method: "POST" });
      setStatus(res.status);
    } catch (e) {
      setStatus("failed");
      setError(e instanceof Error ? e.message : "Analysis failed");
    }
  }, [id]);

  // Check the current status first; only start processing if it's waiting for it
  useEffect(() => {
    if (!id || started.current) return;
    started.current = true;
    apiFetch<{ status: AssessmentStatus }>(`/api/assessments/${id}/status`)
      .then(({ status: s }) => {
        if (s === "submitted" || s === "failed") void run();
        else setStatus(s);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Assessment not found"));
  }, [id, run]);

  // Animate steps while waiting; if another tab is processing, poll until it finishes
  useEffect(() => {
    if (status !== "processing") return;
    const t = setInterval(() => setTick((n) => n + 1), 1500);
    const poll = setInterval(async () => {
      try {
        const { status: s } = await apiFetch<{ status: AssessmentStatus }>(`/api/assessments/${id}/status`);
        if (s === "completed") setStatus(s);
      } catch {
        /* keep waiting */
      }
    }, 3000);
    return () => {
      clearInterval(t);
      clearInterval(poll);
    };
  }, [status, id]);

  useEffect(() => {
    if (status !== "completed") return;
    const t = setTimeout(() => router.push("/dashboard"), 1500);
    return () => clearTimeout(t);
  }, [status, router]);

  if (!id) {
    return <EmptyState title="No assessment selected" action={<ButtonLink href="/assessment">Go to Assessment</ButtonLink>} />;
  }

  if (status === "draft" || status === "in_progress") {
    return (
      <EmptyState
        title="This assessment hasn't been submitted yet"
        action={<ButtonLink href={`/assessment/questionnaire?id=${id}`}>Continue answering</ButtonLink>}
      />
    );
  }

  const active = stepFor(status, tick);

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardBody className="flex flex-col items-center gap-6 py-10 text-center">
          <div className="relative flex size-24 items-center justify-center rounded-full bg-primary/15 ring-1 ring-accent/40">
            <ShieldCheck className={cn("size-12 text-accent", status === "processing" && "animate-pulse")} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {status === "completed" ? "Analysis complete" : status === "failed" ? "Analysis failed" : "Analyzing your assessment"}
            </h1>
            <p className="mt-1 text-sm text-muted" aria-live="polite">
              {status === "completed"
                ? "Taking you to your dashboard…"
                : status === "failed"
                  ? "Your answers are saved. You can safely try again."
                  : "This can take up to a minute. Please keep this page open."}
            </p>
          </div>

          <ol className="flex w-full flex-col gap-2 text-left">
            {STEPS.map((label, i) => {
              const done = i < active;
              const current = i === active && status === "processing";
              const failed = status === "failed" && i === active;
              return (
                <li
                  key={label}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm",
                    current ? "border-primary bg-primary/10" : "border-line",
                  )}
                >
                  {failed ? (
                    <XCircle className="size-5 text-danger" />
                  ) : done ? (
                    <CheckCircle2 className="size-5 text-success" />
                  ) : current ? (
                    <Loader2 className="size-5 animate-spin text-accent" />
                  ) : (
                    <Circle className="size-5 text-subtle" />
                  )}
                  <span className={done || current ? "text-fg" : "text-muted"}>{label}</span>
                </li>
              );
            })}
          </ol>

          {error && <Alert className="w-full">{error}</Alert>}
          {status === "failed" && <Button onClick={run}>Try again</Button>}
          {status === "completed" && <ButtonLink href="/dashboard">Open dashboard</ButtonLink>}
        </CardBody>
      </Card>
    </div>
  );
}
