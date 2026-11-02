import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FunctionBars } from "@/components/charts/function-bars";
import { MaturityRadar } from "@/components/charts/maturity-radar";
import { FRAMEWORK_LABEL } from "@/lib/options";
import { formatDate, formatDateTime } from "@/lib/utils";
import { getSessionUser } from "@/server/auth";
import { getReportData } from "@/server/services/reports";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: "Report" };

const cell = "border-b border-paper-line px-2 py-1.5 text-left";

/** Printable report — the browser's "Save as PDF" produces the PDF */
export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.companyId) notFound();
  const data = await getReportData(user.companyId, (await params).id);
  if (!data) notFound();

  const { dashboard: d, insights, actions } = data;
  const s = d.summary;

  return (
    <div className="report-paper min-h-screen">
      <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-paper-line bg-paper-2 px-6 py-3">
        <Link href="/reports" className="text-sm text-ink-muted hover:underline">
          ← Back to Reports
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-10 text-sm">
        <header className="report-section border-b-2 border-primary pb-4">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">ByteGuardian</p>
          <h1 className="mt-1 text-3xl font-bold">{data.report.title}</h1>
          <p className="mt-1 text-ink-muted">
            {data.companyName} · {FRAMEWORK_LABEL[data.framework]} · Assessment completed {formatDate(d.assessment.completedAt)}
          </p>
          <p className="text-xs text-ink-muted">Generated {formatDateTime(data.report.createdAt)}</p>
          {d.isMock && (
            <p className="mt-3 rounded border border-warning bg-warning/10 px-3 py-2 text-xs font-semibold">
              MOCK DATA — scores and AI output are placeholders until the scoring rules and AI service are delivered.
            </p>
          )}
        </header>

        <section className="report-section">
          <h2 className="mb-3 text-lg font-bold">1. Summary</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Current tier", `${s.currentTier.toFixed(1)} / ${s.maxTier}`, s.currentTierLabel],
              ["Target tier", `${s.targetTier.toFixed(1)} / ${s.maxTier}`, s.targetTierLabel],
              ["Overall gap", s.overallGap.toFixed(1), ""],
              ["Risk level", s.riskLevel, `Risk score ${d.risk.overallScore}`],
            ].map(([label, value, sub]) => (
              <div key={label} className="rounded-lg border border-paper-line bg-paper-2 p-3">
                <p className="text-xs text-ink-muted">{label}</p>
                <p className="text-xl font-bold capitalize">{value}</p>
                {sub && <p className="text-xs text-ink-muted">{sub}</p>}
              </div>
            ))}
          </div>
          {insights?.summary && <p className="mt-3 leading-relaxed">{insights.summary}</p>}
        </section>

        <section className="report-section">
          <h2 className="mb-3 text-lg font-bold">2. Maturity by function</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <MaturityRadar data={d.functionScores} maxTier={s.maxTier} />
            <FunctionBars data={d.functionScores} maxTier={s.maxTier} />
          </div>
          <table className="mt-3 w-full border-collapse">
            <thead>
              <tr className="text-xs text-ink-muted">
                <th className={cell}>Function</th>
                <th className={cell}>Current</th>
                <th className={cell}>Target</th>
                <th className={cell}>Gap</th>
              </tr>
            </thead>
            <tbody>
              {d.functionScores.map((f) => (
                <tr key={f.function}>
                  <td className={cell}>
                    {f.name} ({f.function})
                  </td>
                  <td className={cell}>{f.current.toFixed(1)}</td>
                  <td className={cell}>{f.target.toFixed(1)}</td>
                  <td className={cell}>{(f.target - f.current).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="report-section">
          <h2 className="mb-3 text-lg font-bold">3. Gap analysis by category</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-xs text-ink-muted">
                <th className={cell}>Category</th>
                <th className={cell}>Name</th>
                <th className={cell}>Current tier</th>
              </tr>
            </thead>
            <tbody>
              {d.categoryScores.map((c) => (
                <tr key={c.category}>
                  <td className={cell}>{c.category}</td>
                  <td className={cell}>{c.name}</td>
                  <td className={cell}>{c.current.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="report-section">
          <h2 className="mb-3 text-lg font-bold">4. Risk</h2>
          <p>
            {Object.entries(d.risk.counts)
              .map(([k, n]) => `${n} ${k}`)
              .join(" · ")}
          </p>
          <ul className="mt-2 list-inside list-disc">
            {d.risk.topRisks.map((r) => (
              <li key={r.title}>
                {r.title} — <span className="capitalize">{r.level}</span>
              </li>
            ))}
          </ul>
        </section>

        {insights && (
          <section className="report-section">
            <h2 className="mb-3 text-lg font-bold">5. AI insights</h2>
            <h3 className="font-semibold">Key findings</h3>
            <ul className="mb-3 list-inside list-disc">
              {insights.keyFindings.map((f, i) => (
                <li key={i}>
                  <strong>{f.title}</strong> ({f.priority}) — {f.detail}
                </li>
              ))}
            </ul>
            <h3 className="font-semibold">Recommendations</h3>
            <ul className="list-inside list-disc">
              {insights.recommendations.map((r, i) => (
                <li key={i}>
                  <strong>{r.title}</strong> ({r.priority}) — {r.detail}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="report-section">
          <h2 className="mb-3 text-lg font-bold">6. Action plan</h2>
          {actions.length === 0 ? (
            <p className="text-ink-muted">No actions in the plan.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-xs text-ink-muted">
                  <th className={cell}>Action</th>
                  <th className={cell}>Priority</th>
                  <th className={cell}>Team</th>
                  <th className={cell}>Cost</th>
                  <th className={cell}>Phase</th>
                  <th className={cell}>Progress</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((a) => (
                  <tr key={a.id}>
                    <td className={cell}>{a.title}</td>
                    <td className={`${cell} capitalize`}>{a.priority}</td>
                    <td className={cell}>{a.responsibleTeam}</td>
                    <td className={cell}>{a.estimatedCost}</td>
                    <td className={cell}>{a.phase}</td>
                    <td className={cell}>{a.progress}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <footer className="border-t border-paper-line pt-3 text-xs text-ink-muted">
          ByteGuardian · Confidential — prepared for {data.companyName}
        </footer>
      </article>
    </div>
  );
}
