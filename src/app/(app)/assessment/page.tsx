import type { Metadata } from "next";
import { PageHeader, PagePlaceholder } from "@/components/ui/page";

export const metadata: Metadata = { title: "Assessment Setup" };

// Owner: ไวท์ — Figma frame "05 Assessment Setup"
export default function AssessmentPage() {
  return (
    <>
      <PageHeader title="Assessment Setup" description="Choose the scope and framework for your assessment." />
      <PagePlaceholder
        owner="ไวท์"
        reference='Figma frame "05 Assessment Setup"'
        todo={[
          "Type: Full / Quick / Custom (selectable cards)",
          "Framework: NIST CSF 2.0 / ISO/IEC 27001 / CIS Controls",
          "Review & confirm, then POST /api/assessments → /assessment/questionnaire",
          "Frameworks, questions and scoring come from the cyber team — do not invent them",
        ]}
      />
    </>
  );
}
