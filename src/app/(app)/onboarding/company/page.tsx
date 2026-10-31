import type { Metadata } from "next";
import { PageHeader, PagePlaceholder } from "@/components/ui/page";

export const metadata: Metadata = { title: "Company Setup" };

// Owner: ไวท์ — Figma frame "04 Company Setup"
export default function OnboardingCompanyPage() {
  return (
    <>
      <PageHeader title="Company Setup" description="Tell us about your organization." />
      <PagePlaceholder
        owner="ไวท์"
        reference='Figma frame "04 Company Setup"'
        todo={[
          "Fields: company name, industry, company size, employees, annual revenue, country, IT infrastructure, cloud environment",
          "Validation (zod) + Save Progress (PATCH /api/company) + Previous / Next",
          "Next → /assessment",
        ]}
      />
    </>
  );
}
