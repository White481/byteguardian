"use client";

// Owner: โอเว่น — Figma frame "08 Executive Dashboard".
// This page is the REFERENCE PATTERN for every data page:
//   useApi() → LoadingState / ErrorState → components fed from the API (no hardcoded numbers).

import Link from "next/link";
import { AlertTriangle, CheckCircle2, ShieldCheck, Sparkles, Target } from "lucide-react";
import { CategoryBars } from "@/components/charts/category-bars";
import { FunctionBars } from "@/components/charts/function-bars";
import { MaturityRadar } from "@/components/charts/maturity-radar";
import { RiskHeatmap } from "@/components/charts/risk-heatmap";
import { NoAssessment } from "@/components/dashboard/no-assessment";
import { MockBadge, PriorityBadge, RiskBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page";
import { StatCard } from "@/components/ui/stat-card";
import { Table, Td, Th } from "@/components/ui/table";
import { useApi } from "@/lib/api-client";
import type { AiInsights, DashboardData } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { data, loading, error, reload } = useApi<DashboardData | null>("/api/dashboard");
  const insights = useApi<AiInsights | null>("/api/insights");

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) {
    return (
      <>
        <PageHeader title="Cybersecurity Maturity Dashboard" />
        <NoAssessment what="dashboard data" />
      </>
    );
  }

  const { summary, functionScores, categoryScores, risk, assessment } = data;

  return (
    <>
      <PageHeader
        title="Cybersecurity Maturity Dashboard"
        description={`Last assessment: ${formatDate(assessment.completedAt)} · NIST CSF 2.0`}
        actions={
          <>
            {data.isMock && <MockBadge />}
            <ButtonLink href="/reports">Download Report</ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Current Tier Score"
          value={summary.currentTier.toFixed(1)}
          suffix={`/ ${summary.maxTier}`}
          icon={<ShieldCheck className="size-6" />}
          footer={<span className="text-xs text-accent">{summary.currentTierLabel}</span>}
        />
        <StatCard
          label="Target Tier Score"
          value={summary.targetTier.toFixed(1)}
          suffix={`/ ${summary.maxTier}`}
          accent="violet"
          icon={<Target className="size-6" />}
          footer={<span className="text-xs text-violet">{summary.targetTierLabel}</span>}
        />
        <StatCard
          label="Overall Gap"
          value={summary.overallGap.toFixed(1)}
          accent="warning"
          icon={<AlertTriangle className="size-6" />}
        />
        <StatCard
          label="Risk Level"
          value={<span className="capitalize">{summary.riskLevel}</span>}
          accent="warning"
          icon={<CheckCircle2 className="size-6" />}
          footer={<RiskBadge level={summary.riskLevel} />}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="Current vs Target" />
          <CardBody>
            <MaturityRadar data={functionScores} maxTier={summary.maxTier} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Score by Function" />
          <CardBody>
            <FunctionBars data={functionScores} maxTier={summary.maxTier} />
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader title="Overall Risk Score" />
          <CardBody>
            <p className="text-5xl font-extrabold">{risk.overallScore}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              {Object.entries(risk.counts).map(([k, n]) => (
                <div key={k} className="rounded-lg bg-surface-2 p-3">
                  <p className="text-xl font-bold">{n}</p>
                  <p className="text-xs text-muted capitalize">{k}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Risk Heatmap" />
          <CardBody>
            <RiskHeatmap grid={risk.heatmap} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Top Risks" />
          <CardBody className="flex flex-col gap-2">
            {risk.topRisks.map((r) => (
              <div key={r.title} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-3 text-sm">
                {r.title}
                <RiskBadge level={r.level} />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader title="Tier Score by Category" />
          <CardBody>
            <CategoryBars data={categoryScores} maxTier={summary.maxTier} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Risk Breakdown by Function" />
          <CardBody>
            <Table className="min-w-0">
              <thead>
                <tr>
                  <Th>Function</Th>
                  <Th className="text-right">Current</Th>
                  <Th className="text-right">Gap</Th>
                </tr>
              </thead>
              <tbody>
                {[...functionScores]
                  .sort((a, b) => b.target - b.current - (a.target - a.current))
                  .map((f) => (
                    <tr key={f.function}>
                      <Td>
                        {f.name} <span className="text-subtle">({f.function})</span>
                      </Td>
                      <Td className="text-right">{f.current.toFixed(1)}</Td>
                      <Td className="text-right font-semibold text-warning">{(f.target - f.current).toFixed(1)}</Td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="AI Insights"
            icon={<Sparkles className="size-5" />}
            action={
              <Link href="/insights" className="text-sm text-accent hover:underline">
                View all
              </Link>
            }
          />
          <CardBody className="flex flex-col gap-2">
            {insights.loading ? (
              <LoadingState />
            ) : insights.error ? (
              <ErrorState message={insights.error} onRetry={insights.reload} />
            ) : (
              (insights.data?.recommendations ?? []).slice(0, 3).map((r, i) => (
                <div key={i} className="rounded-lg bg-surface-2 px-3 py-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium">{r.title}</span>
                    <PriorityBadge priority={r.priority} />
                  </div>
                  <p className="mt-1 text-xs text-muted">{r.detail}</p>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
