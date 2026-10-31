import type { Metadata } from "next";
import { PageHeader, PagePlaceholder } from "@/components/ui/page";

export const metadata: Metadata = { title: "Security Controls Assessment" };

// Owner: ไวท์ — Figma frame "06 Security Assessment"
export default function AssessmentQuestionnairePage() {
  return (
    <>
      <PageHeader title="Security Controls Assessment" description="Answer each control and attach evidence if available." />
      <PagePlaceholder
        owner="ไวท์"
        reference='Figma frame "06 Security Assessment"'
        todo={[
          "Load questions from GET /api/questions?type=…, grouped by GV / ID / PR / DE / RS / RC",
          "Question ID, category, description, Yes / Partially / No, evidence upload, progress bar",
          "Save each answer (PUT /api/assessments/:id/answers) and resume at Assessment.currentIndex",
          "Required-answer validation; Submit → /assessment/processing",
        ]}
      />
    </>
  );
}
