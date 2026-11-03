import type { Metadata } from "next";
import { AssessmentSetup } from "./assessment-setup";

export const metadata: Metadata = { title: "Assessment Setup" };

// Figma frame "05 Assessment Setup"
export default function AssessmentPage() {
  return <AssessmentSetup />;
}
