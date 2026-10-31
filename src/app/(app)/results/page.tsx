import type { Metadata } from "next";
import { PageHeader, PagePlaceholder } from "@/components/ui/page";

export const metadata: Metadata = { title: "Assessment Results" };

// Owner: โอเว่น — Figma frame "09 Assessment Results"
export default function ResultsPage() {
  return (
    <>
      <PageHeader title="Assessment Results" description="Detailed scores by function and category." />
      <PagePlaceholder
        owner="โอเว่น"
        reference='Figma frame "09 Assessment Results"'
        todo={[
          "Function scores table (current / target / gap / progress)",
          "Category scores with function filter",
          "Assessment history + details",
        ]}
      />
    </>
  );
}
