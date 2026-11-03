import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/ui/feedback";
import { Processing } from "./processing";

export const metadata: Metadata = { title: "Processing" };

// Figma frame "07 AI Processing"
export default function ProcessingPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <Processing />
    </Suspense>
  );
}
