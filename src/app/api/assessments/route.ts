import { handle, readJson } from "@/lib/api-response";
import { CreateAssessmentInput } from "@/lib/validation";
import { CAN_EDIT, requireCompanyUser, requireRole } from "@/server/auth";
import { createAssessment, listAssessments } from "@/server/services/assessments";

// GET /api/assessments → AssessmentSummary[] (history, newest first)
export async function GET() {
  return handle(async () => listAssessments((await requireCompanyUser()).companyId));
}

// POST /api/assessments { type, framework, functions? } → AssessmentSummary
export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireCompanyUser();
    requireRole(user, CAN_EDIT);
    return createAssessment(user, CreateAssessmentInput.parse(await readJson(req)));
  }, 201);
}
