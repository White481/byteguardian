import type { Metadata } from "next";
import { CompanySetup } from "./company-setup";

export const metadata: Metadata = { title: "Company Setup" };

// Figma frame "04 Company Setup"
export default function CompanySetupPage() {
  return <CompanySetup />;
}
