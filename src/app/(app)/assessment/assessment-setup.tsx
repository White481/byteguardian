"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ClipboardList, Layers, Rocket, SlidersHorizontal, Zap } from "lucide-react";
import { useCanEdit } from "@/components/session/session-provider";
import { MockBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ChoiceCard } from "@/components/ui/choice-card";
import { Alert, ErrorState, LoadingState, ProgressBar } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page";
import { AssessmentStatusBadge } from "@/components/ui/status-badge";
import { apiFetch, useApi } from "@/lib/api-client";
import { ASSESSMENT_TYPES, FRAMEWORKS, FRAMEWORK_LABEL } from "@/lib/options";
import { FUNCTIONS, type AssessmentSummary, type AssessmentType, type Framework, type FunctionCode, type Question } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const TYPE_ICONS: Record<AssessmentType, React.ReactNode> = {
  full: <Layers className="size-5" />,
  quick: <Zap className="size-5" />,
  custom: <SlidersHorizontal className="size-5" />,
};

export function AssessmentSetup() {
  const router = useRouter();
  const canEdit = useCanEdit();
  const history = useApi<AssessmentSummary[]>("/api/assessments");
  const questions = useApi<Question[]>("/api/questions?type=custom"); // all questions, for counts

  const [type, setType] = useState<AssessmentType>("full");
  const [framework, setFramework] = useState<Framework>("nist-csf-2");
  const [functions, setFunctions] = useState<FunctionCode[]>(FUNCTIONS.map((f) => f.code));
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const all = questions.data ?? [];
    return {
      full: all.filter((q) => q.sets.includes("full")).length,
      quick: all.filter((q) => q.sets.includes("quick")).length,
      custom: all.filter((q) => functions.includes(q.function)).length,
    };
  }, [questions.data, functions]);

  if (history.loading || questions.loading) return <LoadingState label="Loading assessments…" />;
  if (history.error || questions.error) {
    return (
      <ErrorState
        message={history.error ?? questions.error ?? "Error"}
        onRetry={() => {
          history.reload();
          questions.reload();
        }}
      />
    );
  }

  const open = history.data?.find((a) => ["draft", "in_progress", "submitted", "processing", "failed"].includes(a.status));

  async function start() {
    setError(null);
    setStarting(true);
    try {
      const a = await apiFetch<AssessmentSummary>("/api/assessments", {
        method: "POST",
        body: JSON.stringify({ type, framework, ...(type === "custom" ? { functions } : {}) }),
      });
      router.push(`/assessment/questionnaire?id=${a.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the assessment");
      setStarting(false);
    }
  }

  const toggleFunction = (code: FunctionCode) =>
    setFunctions((fs) => (fs.includes(code) ? fs.filter((f) => f !== code) : [...fs, code]));

  const blocked = !canEdit || (type === "custom" && functions.length === 0) || counts[type] === 0;

  return (
    <>
      <PageHeader
        title="Assessment Setup"
        description="Choose the scope and framework for your assessment."
        actions={<MockBadge label="Mock question set" />}
      />

      {open && (
        <Card className="mb-4 border-primary/50">
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-60 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">You have an unfinished assessment</p>
                <AssessmentStatusBadge status={open.status} />
              </div>
              <p className="mt-1 text-sm text-muted">
                {FRAMEWORK_LABEL[open.framework]} · started {formatDate(open.startedAt)} · {open.answeredCount}/
                {open.questionCount} answered
              </p>
              <ProgressBar className="mt-2 max-w-sm" value={(open.answeredCount / Math.max(1, open.questionCount)) * 100} />
            </div>
            <ButtonLink
              href={
                ["draft", "in_progress"].includes(open.status)
                  ? `/assessment/questionnaire?id=${open.id}`
                  : `/assessment/processing?id=${open.id}`
              }
            >
              {["draft", "in_progress"].includes(open.status) ? "Resume assessment" : "View progress"}
            </ButtonLink>
          </CardBody>
        </Card>
      )}

      {!canEdit && (
        <Alert tone="info" className="mb-4">
          You have viewer access, so you can&apos;t start assessments. Ask an admin to change your role.
        </Alert>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <Card>
            <CardHeader title="1. Assessment type" icon={<ClipboardList className="size-5" />} />
            <CardBody>
              <div role="radiogroup" aria-label="Assessment type" className="grid gap-3 sm:grid-cols-3">
                {ASSESSMENT_TYPES.map((t) => (
                  <ChoiceCard
                    key={t.value}
                    selected={type === t.value}
                    onSelect={() => setType(t.value)}
                    icon={TYPE_ICONS[t.value]}
                    title={t.label}
                    description={t.description}
                    meta={`${counts[t.value]} questions`}
                  />
                ))}
              </div>

              {type === "custom" && (
                <fieldset className="mt-4">
                  <legend className="mb-2 text-sm font-medium">Functions to include</legend>
                  <div className="flex flex-wrap gap-2">
                    {FUNCTIONS.map((f) => {
                      const on = functions.includes(f.code);
                      return (
                        <button
                          key={f.code}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleFunction(f.code)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-sm transition-colors",
                            on ? "border-primary bg-primary/15 text-fg" : "border-line text-muted hover:border-line-strong",
                          )}
                        >
                          {f.name} ({f.code})
                        </button>
                      );
                    })}
                  </div>
                  {functions.length === 0 && <p className="mt-2 text-xs text-danger">Choose at least one function.</p>}
                </fieldset>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="2. Framework" icon={<Layers className="size-5" />} />
            <CardBody>
              <div role="radiogroup" aria-label="Framework" className="grid gap-3 sm:grid-cols-3">
                {FRAMEWORKS.map((f) => (
                  <ChoiceCard
                    key={f.value}
                    selected={framework === f.value}
                    disabled={!f.available}
                    onSelect={() => setFramework(f.value)}
                    title={f.label}
                    meta={f.available ? "Available" : "Coming soon — question set pending"}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader title="3. Review & start" icon={<Rocket className="size-5" />} />
          <CardBody className="flex flex-col gap-4">
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted">Type</dt>
              <dd className="text-right">{ASSESSMENT_TYPES.find((t) => t.value === type)?.label}</dd>
              <dt className="text-muted">Framework</dt>
              <dd className="text-right">{FRAMEWORK_LABEL[framework]}</dd>
              <dt className="text-muted">Questions</dt>
              <dd className="text-right">{counts[type]}</dd>
              {type === "custom" && (
                <>
                  <dt className="text-muted">Functions</dt>
                  <dd className="text-right">{functions.join(", ") || "—"}</dd>
                </>
              )}
            </dl>
            <p className="text-xs text-subtle">
              Your answers save automatically, so you can stop and resume any time.
            </p>
            {error && <Alert>{error}</Alert>}
            <Button size="lg" onClick={start} loading={starting} disabled={blocked}>
              Start assessment
            </Button>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
