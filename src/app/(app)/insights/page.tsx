import type { Metadata } from "next";
import { Insights } from "./insights";

export const metadata: Metadata = { title: "AI Insights" };

// Figma frame "10 AI Insights"
export default function InsightsPage() {
  return <Insights />;
}
