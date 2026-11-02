"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Field, Input, Select } from "@/components/ui/form";
import {
  CLOUD_ENVIRONMENTS,
  COMPANY_SIZES,
  COUNTRIES,
  EMPLOYEE_COUNTS,
  INDUSTRIES,
  IT_INFRASTRUCTURES,
  REVENUE_RANGES,
} from "@/lib/options";
import type { CompanyProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CompanyDraftInput, CompanyInput } from "@/lib/validation";
import { useForm } from "./use-form";

type FieldName = Exclude<keyof CompanyProfile, "onboardingCompleted">;

const STEPS: { title: string; description: string; fields: FieldName[] }[] = [
  {
    title: "Business profile",
    description: "Who you are — used to compare you with similar organizations.",
    fields: ["name", "industry", "companySize", "employeeCount", "annualRevenue", "country"],
  },
  {
    title: "Technology profile",
    description: "How your systems are run — shapes the questions and recommendations.",
    fields: ["itInfrastructure", "cloudEnvironment"],
  },
];
const ALL_FIELDS = STEPS.flatMap((s) => s.fields);

const OPTIONS: Record<Exclude<FieldName, "name">, readonly string[]> = {
  industry: INDUSTRIES,
  companySize: COMPANY_SIZES,
  employeeCount: EMPLOYEE_COUNTS,
  annualRevenue: REVENUE_RANGES,
  country: COUNTRIES,
  itInfrastructure: IT_INFRASTRUCTURES,
  cloudEnvironment: CLOUD_ENVIRONMENTS,
};

const LABELS: Record<FieldName, string> = {
  name: "Company name",
  industry: "Industry",
  companySize: "Company size",
  employeeCount: "Number of employees",
  annualRevenue: "Annual revenue",
  country: "Country",
  itInfrastructure: "IT infrastructure",
  cloudEnvironment: "Cloud environment",
};

/**
 * Company Setup form.
 * - mode "onboarding": two steps with Previous / Next / Save progress; the last Next completes onboarding.
 * - mode "settings": every field with one Save button.
 */
export function CompanyForm({
  company,
  mode,
  readOnly,
  onComplete,
}: {
  company: CompanyProfile;
  mode: "onboarding" | "settings";
  readOnly?: boolean;
  onComplete?: (c: CompanyProfile) => void;
}) {
  const form = useForm(CompanyInput, Object.fromEntries(ALL_FIELDS.map((f) => [f, company[f] ?? ""])));
  const [step, setStep] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const fields = mode === "onboarding" ? STEPS[step].fields : ALL_FIELDS;
  const lastStep = step === STEPS.length - 1;

  /** Validate only the fields shown on this step */
  function stepValid() {
    const parsed = CompanyInput.safeParse(form.values);
    if (parsed.success) return true;
    const errs: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if ((fields as string[]).includes(key)) errs[key] ??= issue.message;
    }
    form.setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function saveAll() {
    setNotice(null);
    await form.submit<CompanyProfile>(
      "/api/company",
      (c) => {
        setNotice("Company details saved");
        onComplete?.(c);
      },
      { method: "PATCH" },
    );
  }

  /** "Save progress": only the company name is required; empty selects are left out */
  async function saveDraft() {
    setNotice(null);
    const filled = Object.fromEntries(Object.entries(form.values).filter(([, v]) => v !== ""));
    await form.submit("/api/company?draft=1", () => setNotice("Progress saved — you can finish later"), {
      method: "PATCH",
      schema: CompanyDraftInput,
      values: filled,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {mode === "onboarding" && (
        <ol className="flex gap-2" aria-label="Steps">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              aria-current={i === step ? "step" : undefined}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm",
                i === step ? "border-primary bg-primary/10 text-fg" : i < step ? "border-line text-success" : "border-line text-subtle",
              )}
            >
              <span className="block text-xs">Step {i + 1}</span>
              {s.title}
            </li>
          ))}
        </ol>
      )}
      {mode === "onboarding" && <p className="text-sm text-muted">{STEPS[step].description}</p>}

      {form.formError && <Alert>{form.formError}</Alert>}
      {notice && !form.formError && <Alert tone="success">{notice}</Alert>}

      <fieldset disabled={readOnly || form.submitting} className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <Field key={f} label={LABELS[f]} htmlFor={f} required error={form.errors[f]}>
            {f === "name" ? (
              <Input {...form.field(f)} autoComplete="organization" />
            ) : (
              <Select {...form.field(f)}>
                <option value="">Select…</option>
                {OPTIONS[f].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </Select>
            )}
          </Field>
        ))}
      </fieldset>

      {!readOnly && mode === "settings" && (
        <div className="flex justify-end">
          <Button onClick={saveAll} loading={form.submitting}>
            <Save className="size-4" /> Save changes
          </Button>
        </div>
      )}

      {!readOnly && mode === "onboarding" && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0 || form.submitting}>
            <ArrowLeft className="size-4" /> Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={saveDraft} disabled={form.submitting}>
              <Save className="size-4" /> Save progress
            </Button>
            <Button
              loading={form.submitting}
              onClick={() => {
                if (!stepValid()) return;
                if (lastStep) saveAll();
                else setStep((s) => s + 1);
              }}
            >
              {lastStep ? "Finish & continue" : "Next"} <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
