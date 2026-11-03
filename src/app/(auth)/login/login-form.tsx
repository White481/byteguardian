"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useForm } from "@/components/forms/use-form";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/form";
import { LoginInput } from "@/lib/validation";

export function LoginForm() {
  const router = useRouter();
  const form = useForm(LoginInput, { email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [forgot, setForgot] = useState(false);

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.submit<{ next: string }>("/api/auth/login", ({ next }) => {
          router.replace(next);
          router.refresh();
        });
      }}
    >
      {form.formError && <Alert>{form.formError}</Alert>}

      <Field label="Email" htmlFor="email" required error={form.errors.email}>
        <Input
          {...form.field("email")}
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          icon={<Mail className="size-4" />}
        />
      </Field>

      <Field label="Password" htmlFor="password" required error={form.errors.password}>
        <div className="relative">
          <Input
            {...form.field("password")}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            icon={<Lock className="size-4" />}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-subtle hover:text-fg"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      <div className="flex items-center justify-between text-sm">
        <span className="text-subtle">Sessions last 7 days</span>
        <button type="button" className="text-accent hover:underline" onClick={() => setForgot(true)}>
          Forgot password?
        </button>
      </div>
      {forgot && (
        <Alert tone="info">
          Password reset by email isn&apos;t available yet. Ask your company admin to re-invite you, or contact support.
        </Alert>
      )}

      <Button type="submit" size="lg" loading={form.submitting}>
        Sign in
      </Button>

      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-accent hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
