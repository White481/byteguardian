"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, User } from "lucide-react";
import { useForm } from "@/components/forms/use-form";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Field, Input, Select } from "@/components/ui/form";
import { COMPANY_SIZES } from "@/lib/options";
import { RegisterInput } from "@/lib/validation";

export function RegisterForm() {
  const router = useRouter();
  const form = useForm(RegisterInput, { fullName: "", email: "", password: "", companyName: "", companySize: "" });

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.submit<{ next: string }>("/api/auth/register", ({ next }) => {
          router.replace(next);
          router.refresh();
        });
      }}
    >
      {form.formError && <Alert>{form.formError}</Alert>}

      <Field label="Full name" htmlFor="fullName" required error={form.errors.fullName}>
        <Input {...form.field("fullName")} autoComplete="name" icon={<User className="size-4" />} />
      </Field>
      <Field
        label="Work email"
        htmlFor="email"
        required
        error={form.errors.email}
        hint="Invited by a teammate? Use the email they invited."
      >
        <Input
          {...form.field("email")}
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          icon={<Mail className="size-4" />}
        />
      </Field>
      <Field
        label="Password"
        htmlFor="password"
        required
        error={form.errors.password}
        hint="At least 8 characters, with a letter and a number."
      >
        <Input {...form.field("password")} type="password" autoComplete="new-password" icon={<Lock className="size-4" />} />
      </Field>
      <Field label="Company name" htmlFor="companyName" required error={form.errors.companyName}>
        <Input {...form.field("companyName")} autoComplete="organization" icon={<Building2 className="size-4" />} />
      </Field>
      <Field label="Company size" htmlFor="companySize" required error={form.errors.companySize}>
        <Select {...form.field("companySize")}>
          <option value="">Select…</option>
          {COMPANY_SIZES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
      </Field>

      <Button type="submit" size="lg" loading={form.submitting}>
        Create account
      </Button>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
