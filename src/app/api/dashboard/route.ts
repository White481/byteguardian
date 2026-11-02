import { handle } from "@/lib/api-response";
import { requireCompanyUser } from "@/server/auth";
import { getDashboard } from "@/server/services/dashboard";

// GET /api/dashboard → DashboardData | null (null = no completed assessment yet)
export async function GET() {
  return handle(async () => getDashboard((await requireCompanyUser()).companyId));
}
