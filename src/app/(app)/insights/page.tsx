import type { Metadata } from "next";
import { PageHeader, PagePlaceholder } from "@/components/ui/page";

export const metadata: Metadata = { title: "AI Insights" };

// Owner: พี่ภีม — Figma frame "10 AI Insights"
export default function InsightsPage() {
  return (
    <>
      <PageHeader title="AI Insights" description="AI-generated analysis of your latest assessment." />
      <PagePlaceholder
        owner="พี่ภีม"
        reference='Figma frame "10 AI Insights"'
        todo={[
          "Load GET /api/insights (mock until AI_API_URL is set)",
          "Summary, key findings, security gaps, recommendations with priority filter",
          "\"Add to plan\" creates an ActionItem",
        ]}
      />
    </>
  );
}
