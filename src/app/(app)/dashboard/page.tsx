"use client";

// Owner: โอเว่น — Figma frame "08 Executive Dashboard".
// This page is the REFERENCE PATTERN for every data page:
//   useApi() → LoadingState / ErrorState → components fed from the API (no hardcoded numbers).
// Still to build: Tier Score by Category, Risk Breakdown table, AI Insights card, Download Report.

import { AlertTriangle, CheckCircle2, ShieldCheck, Target } from "lucide-react";
import { FunctionBars } from "@/components/charts/function-bars";
import { MaturityRadar } from "@/components/charts/maturity-radar";
import { RiskHeatmap } from "@/components/charts/risk-heatmap";
import { MockBadge, RiskBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page";
import { StatCard } from "@/components/ui/stat-card";
import { useApi } from "@/lib/api-client";
import type { DashboardData } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { data, loading, error, reload } = useApi<DashboardData>("/api/dashboard");

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error || !data) return <ErrorState message={error ?? "No data"} onRetry={reload} />;

  const { summary, functionScores, risk, assessment } = data;

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
    </>
  );
}
