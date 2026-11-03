"use client";

import { useState } from "react";
import { ExternalLink, FilePlus2, FileText } from "lucide-react";
import { NoAssessment } from "@/components/dashboard/no-assessment";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Alert, EmptyState, ErrorState, LoadingState } from "@/components/ui/feedback";
import { Field, Select } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page";
import { Table, Td, Th } from "@/components/ui/table";
import { apiFetch, useApi } from "@/lib/api-client";
import { ASSESSMENT_TYPE_LABEL, FRAMEWORK_LABEL } from "@/lib/options";
import type { AssessmentSummary, ReportItem } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/utils";

export function Reports() {
  const reports = useApi<ReportItem[]>("/api/reports");
  const history = useApi<AssessmentSummary[]>("/api/assessments");
  const [assessmentId, setAssessmentId] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (reports.loading || history.loading) return <LoadingState label="Loading reports…" />;
  const loadError = reports.error ?? history.error;
  if (loadError) {
    return (
      <ErrorState
        message={loadError}
        onRetry={() => {
          reports.reload();
          history.reload();
        }}
      />
    );
  }

  const completed = (history.data ?? []).filter((a) => a.status === "completed");
  const selected = assessmentId || completed[0]?.id || "";
  const byId = new Map(completed.map((a) => [a.id, a]));

  async function generate() {
    setError(null);
    setCreating(true);
    try {
      const r = await apiFetch<ReportItem>("/api/reports", {
        method: "POST",
        body: JSON.stringify({ assessmentId: selected }),
      });
      reports.setData((list) => [r, ...(list ?? [])]);
      window.open(`/reports/${r.id}`, "_blank", "noopener");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the report");
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <PageHeader title="Reports" description="Generate a full report and save it as PDF from the report page." />

      {completed.length === 0 ? (
        <NoAssessment what="reports" />
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="h-fit">
            <CardHeader title="Generate report" icon={<FilePlus2 className="size-5" />} />
            <CardBody className="flex flex-col gap-4">
              <Field label="Assessment" htmlFor="assessment">
                <Select id="assessment" value={selected} onChange={(e) => setAssessmentId(e.target.value)}>
                  {completed.map((a) => (
                    <option key={a.id} value={a.id}>
                      {formatDate(a.completedAt ?? a.startedAt)} · {ASSESSMENT_TYPE_LABEL[a.type]} ·{" "}
                      {FRAMEWORK_LABEL[a.framework]}
                    </option>
                  ))}
                </Select>
              </Field>
              <p className="text-xs text-subtle">
                Includes scores, gap analysis, risk, AI insights and the action plan. Opens in a new tab — use
                &ldquo;Save as PDF&rdquo; there.
              </p>
              {error && <Alert>{error}</Alert>}
              <Button onClick={generate} loading={creating} disabled={!selected}>
                <FileText className="size-4" /> Generate report
              </Button>
            </CardBody>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader title="Report history" />
            <CardBody>
              {!reports.data?.length ? (
                <EmptyState title="No reports yet" description="Generated reports will appear here." />
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <Th>Report</Th>
                      <Th>Assessment</Th>
                      <Th>Created</Th>
                      <Th />
                    </tr>
                  </thead>
                  <tbody>
                    {reports.data.map((r) => {
                      const a = byId.get(r.assessmentId);
                      return (
                        <tr key={r.id}>
                          <Td className="font-medium text-fg">{r.title}</Td>
                          <Td>{a ? `${ASSESSMENT_TYPE_LABEL[a.type]} · ${FRAMEWORK_LABEL[a.framework]}` : "—"}</Td>
                          <Td className="whitespace-nowrap">{formatDateTime(r.createdAt)}</Td>
                          <Td className="text-right">
                            <ButtonLink href={`/reports/${r.id}`} target="_blank" variant="outline" size="sm">
                              Open <ExternalLink className="size-3.5" />
                            </ButtonLink>
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
}
