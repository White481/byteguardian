import type { Metadata } from "next";
import { Reports } from "./reports";

export const metadata: Metadata = { title: "Reports" };

// Figma frame "12 Reports"
export default function ReportsPage() {
  return <Reports />;
}
