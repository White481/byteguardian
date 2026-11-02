import type { NextRequest } from "next/server";
import { handle, readJson } from "@/lib/api-response";
import { db } from "@/lib/db";
import { CompanyDraftInput, CompanyInput } from "@/lib/validation";
import { requireCompanyUser, requireRole, requireUser } from "@/server/auth";
import { getCompany, updateCompany } from "@/server/services/company";

// GET /api/company → CompanyProfile
export async function GET() {
  return handle(async () => getCompany((await requireCompanyUser()).companyId));
}

// PATCH /api/company            → full validation, marks onboarding complete
// PATCH /api/company?draft=1    → "Save progress": only the name is required
export async function PATCH(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const draft = req.nextUrl.searchParams.get("draft") === "1";
    const body = await readJson(req);
    const input = draft ? CompanyDraftInput.parse(body) : CompanyInput.parse(body);

    // A user removed from their old company starts a new one and becomes its admin
    if (!user.companyId) {
      const company = await db.company.create({ data: { name: input.name } });
      await db.user.update({ where: { id: user.id }, data: { companyId: company.id, role: "admin" } });
      return updateCompany(company.id, input, !draft);
    }
    requireRole(user, ["admin"]);
    return updateCompany(user.companyId, input, !draft);
  });
}
