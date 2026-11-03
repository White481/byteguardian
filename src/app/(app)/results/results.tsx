"use client";

import Link from "next/link";
import { useState } from "react";
import { CategoryBars } from "@/components/charts/category-bars";
import { NoAssessment } from "@/components/dashboard/no-assessment";
import { MockBadge, RiskBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState, ProgressBar } from "@/components/ui/feedback";
import { Select } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page";
import { AssessmentStatusBadge } from "@/components/ui/status-badge";
import { Table, Td, Th } from "@/components/ui/table";
import { useApi } from "@/lib/api-client";
import { ASSESSMENT_TYPE_LABEL, FRAMEWORK_LABEL } from "@/lib/options";
import { FUNCTIONS, type AssessmentSummary, type DashboardData, type FunctionCode } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function Results() {
  const dash = useApi<DashboardData | null>("/api/dashboard");
  const history = useApi<AssessmentSummary[]>("/api/assessments");
  const [filter, setFilter] = useState<FunctionCode | "all">("all");

  if (dash.loading || history.loading) return <LoadingState label="Loading results…" />;
  const error = dash.error ?? history.error;
  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          dash.reload();
          history.reload();
        }}
      />
    );
  }

  const data = dash.data;
  const categories = data?.categoryScores.filter((c) => filter === "all" || c.category.startsWith(filter + ".")) ?? [];

  return (
    <>
      <PageHeader
        title="Assessment Results"
        description={data ? `Latest results from ${formatDate(data.assessment.completedAt)}` : undefined}
        actions={data?.isMock && <MockBadge />}
      />

      {!data ? (
        <NoAssessment />
      ) : (
        <div className="grid gap-4 xl:grid-cols-5">
          <Card className="xl:col-span-3">
            <CardHeader title="Function Scores" description={`Tier scale 0–${data.summary.maxTier}`} />
            <CardBody>
              <Table>
                <thead>
                  <tr>
                    <Th>Function</Th>
                    <Th className="text-right">Current</Th>
                    <Th className="text-right">Target</Th>
                    <Th className="text-right">Gap</Th>
                    <Th className="w-40">Progress to target</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.functionScores.map((f) => (
                    <tr key={f.function}>
                      <Td>
                        <span className="font-medium text-fg">{f.name}</span>{" "}
                        <span className="text-subtle">({f.function})</span>
                      </Td>
                      <Td className="text-right">{f.current.toFixed(1)}</Td>
                      <Td className="text-right">{f.target.toFixed(1)}</Td>
                      <Td className="text-right text-warning">{(f.target - f.current).toFixed(1)}</Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <ProgressBar value={(f.current / f.target) * 100} />
                          <span className="w-10 text-right text-xs">{Math.round((f.current / f.target) * 100)}%</span>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <Td className="font-semibold text-fg">Overall</Td>
                    <Td className="text-right font-semibold text-fg">{data.summary.currentTier.toFixed(1)}</Td>
                    <Td className="text-right font-semibold text-fg">{data.summary.targetTier.toFixed(1)}</Td>
                    <Td className="text-right font-semibold text-warning">{data.summary.overallGap.toFixed(1)}</Td>
                    <Td>
                      <RiskBadge level={data.summary.riskLevel} />
                    </Td>
                  </tr>
                </tfoot>
              </Table>
            </CardBody>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader
              title="Category Scores"
              action={
                <Select
                  aria-label="Filter by function"
                  className="h-9 w-40"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FunctionCode | "all")}
                >
                  <option value="all">All functions</option>
                  {FUNCTIONS.map((f) => (
                    <option key={f.code} value={f.code}>
                      {f.name}
                    </option>
                  ))}
                </Select>
              }
            />
            <CardBody>
              {categories.length ? (
                <CategoryBars data={categories} maxTier={data.summary.maxTier} />
              ) : (
                <EmptyState title="No categories for this function" />
              )}
            </CardBody>
          </Card>
        </div>
      )}

      <Card className="mt-4">
        <CardHeader title="Assessment History" />
        <CardBody>
          {!history.data?.length ? (
            <EmptyState
              title="No assessments yet"
              action={<ButtonLink href="/assessment">Start assessment</ButtonLink>}
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Started</Th>
                  <Th>Type</Th>
                  <Th>Framework</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Answered</Th>
                  <Th className="text-right">Tier</Th>
                  <Th>Risk</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {history.data.map((a) => (
                  <tr key={a.id}>
                    <Td>{formatDate(a.startedAt)}</Td>
                    <Td>{ASSESSMENT_TYPE_LABEL[a.type]}</Td>
                    <Td>{FRAMEWORK_LABEL[a.framework]}</Td>
                    <Td>
                      <AssessmentStatusBadge status={a.status} />
                    </Td>
                    <Td className="text-right">
                      {a.answeredCount}/{a.questionCount}
                    </Td>
                    <Td className="text-right">{a.currentTier?.toFixed(1) ?? "—"}</Td>
                    <Td>{a.riskLevel ? <RiskBadge level={a.riskLevel} /> : "—"}</Td>
                    <Td className="text-right">
                      {a.status === "completed" ? (
                        <Link href="/reports" className="text-accent hover:underline">
                          Report
                        </Link>
                      ) : ["draft", "in_progress"].includes(a.status) ? (
                        <Link href={`/assessment/questionnaire?id=${a.id}`} className="text-accent hover:underline">
                          Resume
                        </Link>
                      ) : (
                        <Link href={`/assessment/processing?id=${a.id}`} className="text-accent hover:underline">
                          Status
                        </Link>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </>
  );
}
