"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, CircleDashed, Loader2, Paperclip, Send, Upload } from "lucide-react";
import { useCanEdit } from "@/components/session/session-provider";
import { Badge, MockBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Alert, EmptyState, ErrorState, LoadingState, ProgressBar } from "@/components/ui/feedback";
import { Label, Textarea } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page";
import { ApiRequestError, apiFetch, useApi } from "@/lib/api-client";
import { FRAMEWORK_LABEL } from "@/lib/options";
import { FUNCTIONS, type AnswerState, type AnswerValue, type AssessmentDetail } from "@/lib/types";
import { cn } from "@/lib/utils";

const ANSWERS: { value: AnswerValue; label: string; hint: string; tone: string }[] = [
  { value: "yes", label: "Yes", hint: "Fully in place", tone: "border-success bg-success/10" },
  { value: "partially", label: "Partially", hint: "Some of it is in place", tone: "border-warning bg-warning/10" },
  { value: "no", label: "No", hint: "Not in place", tone: "border-danger bg-danger/10" },
];

type SaveState = "idle" | "saving" | "saved" | "error";

export function Questionnaire() {
  const id = useSearchParams().get("id");
  if (!id) {
    return (
      <EmptyState
        title="No assessment selected"
        description="Start a new assessment or resume one from Assessment Setup."
        action={<ButtonLink href="/assessment">Go to Assessment Setup</ButtonLink>}
      />
    );
  }
  return <QuestionnaireLoader id={id} />;
}

function QuestionnaireLoader({ id }: { id: string }) {
  const { data, loading, error, reload } = useApi<AssessmentDetail>(`/api/assessments/${id}`);
  if (loading) return <LoadingState label="Loading questions…" />;
  if (error || !data) return <ErrorState message={error ?? "Assessment not found"} onRetry={reload} />;
  if (!["draft", "in_progress"].includes(data.status)) {
    return (
      <EmptyState
        title="This assessment was already submitted"
        description="Answers can't be changed after submission."
        action={<ButtonLink href={`/assessment/processing?id=${id}`}>View status</ButtonLink>}
      />
    );
  }
  if (data.questions.length === 0) {
    return <EmptyState title="No questions in this assessment" action={<ButtonLink href="/assessment">Back</ButtonLink>} />;
  }
  return <QuestionnaireForm detail={data} />;
}

function QuestionnaireForm({ detail }: { detail: AssessmentDetail }) {
  const router = useRouter();
  const canEdit = useCanEdit();
  const { questions } = detail;
  const [index, setIndex] = useState(Math.min(detail.currentIndex, questions.length - 1));
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(detail.answers);
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(detail.answers).map(([k, v]) => [k, v.note ?? ""])),
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const q = questions[index];
  const answer = answers[q.id];
  const answeredCount = questions.filter((x) => answers[x.id]).length;
  const unanswered = questions.filter((x) => !answers[x.id]);

  const groups = useMemo(
    () =>
      FUNCTIONS.map((f) => ({
        ...f,
        items: questions.map((x, i) => ({ q: x, i })).filter(({ q: x }) => x.function === f.code),
      })).filter((g) => g.items.length),
    [questions],
  );

  // Remember the position so "Resume" opens the same question
  const lastSavedIndex = useRef(detail.currentIndex);
  useEffect(() => {
    if (!answer || lastSavedIndex.current === index) return;
    lastSavedIndex.current = index;
    void apiFetch(`/api/assessments/${detail.id}/answers`, {
      method: "PUT",
      body: JSON.stringify({ questionId: q.id, value: answer.value, note: notes[q.id] || null, currentIndex: index }),
    }).catch(() => {});
    // only when the position changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  async function save(questionId: string, value: AnswerValue, note: string) {
    setSaveState("saving");
    setError(null);
    try {
      await apiFetch(`/api/assessments/${detail.id}/answers`, {
        method: "PUT",
        body: JSON.stringify({ questionId, value, note: note || null, currentIndex: index }),
      });
      lastSavedIndex.current = index;
      setSaveState("saved");
    } catch (e) {
      setSaveState("error");
      setError(e instanceof Error ? e.message : "Could not save your answer");
    }
  }

  function choose(value: AnswerValue) {
    setAnswers((a) => ({ ...a, [q.id]: { value, note: notes[q.id] || null, evidence: a[q.id]?.evidence ?? [] } }));
    void save(q.id, value, notes[q.id] ?? "");
  }

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.set("questionId", q.id);
      body.set("file", file);
      const res = await fetch(`/api/assessments/${detail.id}/evidence`, { method: "POST", body });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new ApiRequestError(res.status, json?.error?.code ?? "UNKNOWN", json?.error?.message ?? "Upload failed");
      setAnswers((a) => ({ ...a, [q.id]: { ...a[q.id], evidence: [...a[q.id].evidence, json] } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function submit() {
    if (unanswered.length) {
      setError(`Answer every question before submitting — ${unanswered.length} left.`);
      setIndex(questions.indexOf(unanswered[0]));
      return;
    }
    if (!window.confirm("Submit the assessment? You won't be able to change answers afterwards.")) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/api/assessments/${detail.id}/submit`, { method: "POST" });
      router.push(`/assessment/processing?id=${detail.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit");
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Security Assessment"
        description={`${FRAMEWORK_LABEL[detail.framework]} · ${answeredCount} of ${questions.length} answered`}
        actions={<MockBadge label="Draft questions" />}
      />

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit lg:sticky lg:top-4">
          <CardBody>
            <p className="mb-1 text-sm font-medium">Progress</p>
            <ProgressBar value={(answeredCount / questions.length) * 100} />
            <nav aria-label="Questions" className="mt-4 flex flex-col gap-3">
              {groups.map((g) => (
                <div key={g.code}>
                  <p className="mb-1 text-xs font-semibold tracking-wide text-subtle uppercase">
                    {g.name} ({g.code})
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    {g.items.map(({ q: x, i }) => (
                      <li key={x.id}>
                        <button
                          type="button"
                          onClick={() => setIndex(i)}
                          aria-current={i === index ? "step" : undefined}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                            i === index ? "bg-primary/15 text-fg" : "text-fg-soft hover:bg-surface-2",
                          )}
                        >
                          {answers[x.id] ? (
                            <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Answered" />
                          ) : (
                            <CircleDashed className="size-4 shrink-0 text-subtle" aria-label="Not answered" />
                          )}
                          {x.id}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="primary">{q.id}</Badge>
                <Badge>{q.categoryName}</Badge>
                {q.evidenceRequired && <Badge tone="warning">Evidence required</Badge>}
              </div>
              <span className="text-xs text-subtle" aria-live="polite">
                Question {index + 1} of {questions.length}
                {saveState === "saving" && (
                  <span className="ml-2 inline-flex items-center gap-1">
                    <Loader2 className="size-3 animate-spin" /> Saving…
                  </span>
                )}
                {saveState === "saved" && (
                  <span className="ml-2 inline-flex items-center gap-1 text-success">
                    <Check className="size-3" /> Saved
                  </span>
                )}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-semibold">{q.text}</h2>
              {q.description && <p className="mt-2 text-sm text-muted">{q.description}</p>}
            </div>

            <div role="radiogroup" aria-label="Your answer" className="grid gap-3 sm:grid-cols-3">
              {ANSWERS.map((a) => {
                const selected = answer?.value === a.value;
                return (
                  <button
                    key={a.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={!canEdit}
                    onClick={() => choose(a.value)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                      selected ? a.tone : "border-line bg-surface-2 hover:border-line-strong",
                    )}
                  >
                    <span className="block font-semibold">{a.label}</span>
                    <span className="text-sm text-muted">{a.hint}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <Label htmlFor="note">Notes (optional)</Label>
              <Textarea
                id="note"
                value={notes[q.id] ?? ""}
                maxLength={2000}
                disabled={!canEdit || !answer}
                placeholder={answer ? "Add context for this answer…" : "Choose an answer first"}
                onChange={(e) => setNotes((n) => ({ ...n, [q.id]: e.target.value }))}
                onBlur={() => {
                  if (answer && (notes[q.id] ?? "") !== (answer.note ?? "")) {
                    setAnswers((a) => ({ ...a, [q.id]: { ...a[q.id], note: notes[q.id] || null } }));
                    void save(q.id, answer.value, notes[q.id] ?? "");
                  }
                }}
              />
            </div>

            <div>
              <p className="mb-1.5 text-sm font-medium">Evidence (optional)</p>
              {answer?.evidence.length ? (
                <ul className="mb-2 flex flex-col gap-1 text-sm">
                  {answer.evidence.map((e) => (
                    <li key={e.id} className="flex items-center gap-2 text-fg-soft">
                      <Paperclip className="size-4 text-subtle" /> {e.fileName}
                    </li>
                  ))}
                </ul>
              ) : null}
              <input
                ref={fileInput}
                type="file"
                className="sr-only"
                id="evidence"
                accept=".pdf,.png,.jpg,.jpeg,.txt,.docx,.xlsx"
                onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
              />
              <Button
                variant="outline"
                size="sm"
                loading={uploading}
                disabled={!canEdit || !answer}
                onClick={() => fileInput.current?.click()}
              >
                <Upload className="size-4" /> Upload file
              </Button>
              <p className="mt-1 text-xs text-subtle">PDF, PNG, JPG, TXT, DOCX or XLSX · up to 10 MB</p>
            </div>

            {error && <Alert>{error}</Alert>}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <Button variant="ghost" onClick={() => setIndex((i) => i - 1)} disabled={index === 0}>
                <ArrowLeft className="size-4" /> Previous
              </Button>
              {index < questions.length - 1 ? (
                <Button onClick={() => setIndex((i) => i + 1)}>
                  Next <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button onClick={submit} loading={submitting} disabled={!canEdit}>
                  <Send className="size-4" /> Submit assessment
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
