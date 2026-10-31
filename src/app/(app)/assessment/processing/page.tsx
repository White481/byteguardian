import type { Metadata } from "next";
import { PageHeader, PagePlaceholder } from "@/components/ui/page";

export const metadata: Metadata = { title: "Analyzing your assessment" };

// Owner: ไวท์ — Figma frame "07 Processing"
export default function AssessmentProcessingPage() {
  return (
    <>
      <PageHeader title="Analyzing your assessment" description="Submitted → Processing → AI analysis → Results." />
      <PagePlaceholder
        owner="ไวท์"
        reference='Figma frame "07 Processing"'
        todo={[
          "Status steps driven by Assessment.status from the API (poll every few seconds)",
          "Calls server-side analyzeAssessment() (src/server/ai-client.ts)",
          "When completed → /dashboard",
        ]}
      />
    </>
  );
}
