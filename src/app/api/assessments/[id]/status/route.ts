import { handle } from "@/lib/api-response";
import { requireCompanyUser } from "@/server/auth";
import { getStatus } from "@/server/services/assessments";

// GET /api/assessments/:id/status → { status } (polled by the Processing page)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => getStatus((await requireCompanyUser()).companyId, (await params).id));
}
