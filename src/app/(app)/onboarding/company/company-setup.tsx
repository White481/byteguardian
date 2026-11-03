"use client";

import { useRouter } from "next/navigation";
import { CompanyForm } from "@/components/forms/company-form";
import { useSession } from "@/components/session/session-provider";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Alert, ErrorState, LoadingState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page";
import { useApi } from "@/lib/api-client";
import type { CompanyProfile } from "@/lib/types";

const EMPTY: CompanyProfile = {
  name: "",
  industry: null,
  companySize: null,
  employeeCount: null,
  annualRevenue: null,
  country: null,
  itInfrastructure: null,
  cloudEnvironment: null,
  onboardingCompleted: false,
};

export function CompanySetup() {
  const user = useSession();
  const router = useRouter();
  // Someone removed from their company starts a new one here
  const { data, loading, error, reload } = useApi<CompanyProfile>(user.companyId ? "/api/company" : null);

  if (loading) return <LoadingState label="Loading company…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const company = data ?? EMPTY;
  const isAdmin = user.role === "admin" || !user.companyId;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Tell us about your company"
        description="This helps tailor the assessment and recommendations to your organization."
      />
      <Card>
        <CardBody>
          {!isAdmin && (
            <Alert tone="info" className="mb-4">
              Only an admin can change company details.{" "}
              <ButtonLink href="/assessment" variant="ghost" size="sm">
                Continue to assessment →
              </ButtonLink>
            </Alert>
          )}
          <CompanyForm
            company={company}
            mode="onboarding"
            readOnly={!isAdmin}
            onComplete={() => {
              router.push("/assessment");
              router.refresh();
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
