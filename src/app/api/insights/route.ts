import { handle } from "@/lib/api-response";
import { analyzeAssessment } from "@/server/ai-client";

// GET /api/insights — TODO(พี่ภีม): read stored AI output for the latest assessment instead of calling AI each time
export async function GET() {
  return handle(() => analyzeAssessment({ assessmentId: "mock-assessment-1" }));
}
