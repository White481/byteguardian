import type { Metadata } from "next";
import { PageHeader, PagePlaceholder } from "@/components/ui/page";

export const metadata: Metadata = { title: "Reports" };

// Owner: พี่ภีม — Figma frame "12 Reports"
export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports" description="Generate and download assessment reports." />
      <PagePlaceholder
        owner="พี่ภีม"
        reference='Figma frame "12 Reports"'
        todo={[
          "Report list + history",
          "PDF generation (e.g. @react-pdf/renderer or Playwright print) and download",
          "Report includes: scores, gap analysis, risk, AI insights, action plan",
        ]}
      />
    </>
  );
}
