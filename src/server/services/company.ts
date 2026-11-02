import "server-only";
import type { z } from "zod";
import { db } from "@/lib/db";
import type { CompanyProfile } from "@/lib/types";
import type { CompanyDraftInput } from "@/lib/validation";

export async function getCompany(companyId: string): Promise<CompanyProfile> {
  const c = await db.company.findUniqueOrThrow({ where: { id: companyId } });
  return {
    name: c.name,
    industry: c.industry,
    companySize: c.companySize,
    employeeCount: c.employeeCount,
    annualRevenue: c.annualRevenue,
    country: c.country,
    itInfrastructure: c.itInfrastructure,
    cloudEnvironment: c.cloudEnvironment,
    onboardingCompleted: c.onboardingCompleted,
  };
}

/** `complete` = the full form was validated (Next / Save in Settings), not just "Save progress" */
export async function updateCompany(
  companyId: string,
  input: z.infer<typeof CompanyDraftInput>,
  complete: boolean,
): Promise<CompanyProfile> {
  await db.company.update({
    where: { id: companyId },
    data: { ...input, ...(complete ? { onboardingCompleted: true } : {}) },
  });
  return getCompany(companyId);
}
