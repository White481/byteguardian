"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, KeyRound, Save, UserRound } from "lucide-react";
import { CompanyForm } from "@/components/forms/company-form";
import { useForm } from "@/components/forms/use-form";
import { useSession } from "@/components/session/session-provider";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Alert, ErrorState, LoadingState } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page";
import { useApi } from "@/lib/api-client";
import type { CompanyProfile } from "@/lib/types";
import { PasswordInput, ProfileInput } from "@/lib/validation";

export function Settings() {
  return (
    <>
      <PageHeader title="Settings" description="Manage your profile, password and company details." />
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="flex flex-col gap-4">
          <ProfileCard />
          <PasswordCard />
        </div>
        <CompanyCard />
      </div>
    </>
  );
}

function ProfileCard() {
  const user = useSession();
  const router = useRouter();
  const form = useForm(ProfileInput, { fullName: user.fullName, email: user.email });
  const [saved, setSaved] = useState(false);

  return (
    <Card>
      <CardHeader title="Profile" icon={<UserRound className="size-5" />} />
      <CardBody>
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(false);
            form.submit(
              "/api/me",
              () => {
                setSaved(true);
                router.refresh(); // update the name in the top bar
              },
              { method: "PATCH" },
            );
          }}
        >
          {form.formError && <Alert>{form.formError}</Alert>}
          {saved && <Alert tone="success">Profile saved</Alert>}
          <Field label="Full name" htmlFor="fullName" required error={form.errors.fullName}>
            <Input {...form.field("fullName")} autoComplete="name" />
          </Field>
          <Field label="Email" htmlFor="email" required error={form.errors.email}>
            <Input {...form.field("email")} type="email" autoComplete="email" />
          </Field>
          <div className="flex justify-end">
            <Button type="submit" loading={form.submitting}>
              <Save className="size-4" /> Save profile
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

function PasswordCard() {
  const empty = { currentPassword: "", newPassword: "", confirmPassword: "" };
  const form = useForm(PasswordInput, empty);
  const [saved, setSaved] = useState(false);

  return (
    <Card>
      <CardHeader title="Password" icon={<KeyRound className="size-5" />} />
      <CardBody>
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(false);
            form.submit("/api/me/password", () => {
              setSaved(true);
              form.setValues(empty);
            });
          }}
        >
          {form.formError && <Alert>{form.formError}</Alert>}
          {saved && <Alert tone="success">Password changed. Other devices were signed out.</Alert>}
          <Field label="Current password" htmlFor="currentPassword" required error={form.errors.currentPassword}>
            <Input {...form.field("currentPassword")} type="password" autoComplete="current-password" />
          </Field>
          <Field
            label="New password"
            htmlFor="newPassword"
            required
            error={form.errors.newPassword}
            hint="At least 8 characters, with a letter and a number."
          >
            <Input {...form.field("newPassword")} type="password" autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password" htmlFor="confirmPassword" required error={form.errors.confirmPassword}>
            <Input {...form.field("confirmPassword")} type="password" autoComplete="new-password" />
          </Field>
          <div className="flex justify-end">
            <Button type="submit" loading={form.submitting}>
              Change password
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

function CompanyCard() {
  const user = useSession();
  const router = useRouter();
  const { data, loading, error, reload } = useApi<CompanyProfile>(user.companyId ? "/api/company" : null);

  return (
    <Card className="h-fit">
      <CardHeader title="Company" icon={<Building2 className="size-5" />} />
      <CardBody>
        {!user.companyId ? (
          <Alert tone="info">You&apos;re not part of a company. Set one up from Company Setup.</Alert>
        ) : loading ? (
          <LoadingState />
        ) : error || !data ? (
          <ErrorState message={error ?? "No data"} onRetry={reload} />
        ) : (
          <>
            {user.role !== "admin" && (
              <Alert tone="info" className="mb-4">
                Only admins can change company details.
              </Alert>
            )}
            <CompanyForm company={data} mode="settings" readOnly={user.role !== "admin"} onComplete={() => router.refresh()} />
          </>
        )}
      </CardBody>
    </Card>
  );
}
