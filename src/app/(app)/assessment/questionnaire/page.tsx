import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/ui/feedback";
import { Questionnaire } from "./questionnaire";

export const metadata: Metadata = { title: "Security Assessment" };

// Figma frame "06 Security Assessment"
export default function QuestionnairePage() {
  return (
    <Suspense fallback={<LoadingState label="Loading questions…" />}>
      <Questionnaire />
    </Suspense>
  );
}
