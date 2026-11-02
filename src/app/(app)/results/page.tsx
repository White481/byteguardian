import type { Metadata } from "next";
import { Results } from "./results";

export const metadata: Metadata = { title: "Assessment Results" };

// Figma frame "09 Assessment Results"
export default function ResultsPage() {
  return <Results />;
}
