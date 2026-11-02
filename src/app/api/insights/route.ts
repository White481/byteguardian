import { handle } from "@/lib/api-response";
import { requireCompanyUser } from "@/server/auth";
import { getLatestInsights } from "@/server/services/dashboard";

// GET /api/insights → stored AI output of the latest completed assessment, or null
export async function GET() {
  return handle(async () => getLatestInsights((await requireCompanyUser()).companyId));
}
