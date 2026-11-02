import { z } from "zod";
import { handle, readJson } from "@/lib/api-response";
import { requireCompanyUser } from "@/server/auth";
import { createReport, listReports } from "@/server/services/reports";

// GET /api/reports → ReportItem[]
export async function GET() {
  return handle(async () => listReports((await requireCompanyUser()).companyId));
}

// POST /api/reports { assessmentId } → ReportItem (open /reports/:id to view / save as PDF)
export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireCompanyUser();
    const { assessmentId } = z.object({ assessmentId: z.string().min(1) }).parse(await readJson(req));
    return createReport(user.companyId, assessmentId);
  }, 201);
}
