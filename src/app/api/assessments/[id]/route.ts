import { handle } from "@/lib/api-response";
import { requireCompanyUser } from "@/server/auth";
import { getAssessment } from "@/server/services/assessments";

// GET /api/assessments/:id → AssessmentDetail (questions + saved answers, for resuming)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => getAssessment((await requireCompanyUser()).companyId, (await params).id));
}
