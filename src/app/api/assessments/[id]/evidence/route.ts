import { HttpError, handle } from "@/lib/api-response";
import { CAN_EDIT, requireCompanyUser, requireRole } from "@/server/auth";
import { MAX_EVIDENCE_BYTES, addEvidence } from "@/server/services/assessments";

// POST /api/assessments/:id/evidence (multipart: questionId, file) → { id, fileName }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireCompanyUser();
    requireRole(user, CAN_EDIT);
    if (Number(req.headers.get("content-length") ?? 0) > MAX_EVIDENCE_BYTES + 64 * 1024) {
      throw new HttpError(413, "FILE_TOO_LARGE", "Files must be 10 MB or smaller");
    }
    const form = await req.formData().catch(() => {
      throw new HttpError(400, "BAD_FORM", "Expected a multipart form upload");
    });
    const questionId = form.get("questionId");
    const file = form.get("file");
    if (typeof questionId !== "string" || !(file instanceof File)) {
      throw new HttpError(422, "VALIDATION_ERROR", "questionId and file are required");
    }
    return addEvidence(user.companyId, (await params).id, questionId, file);
  }, 201);
}
