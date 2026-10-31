import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/page";

export const metadata: Metadata = { title: "Sign in" };

// Owner: ตัง — Figma frame "02 Login"
export default function LoginPage() {
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Welcome back</h1>
      <PagePlaceholder
        owner="ตัง"
        reference='Figma frame "02 Login"'
        todo={[
          "Email + password form with validation (zod) and error messages",
          "Remember me, Forgot password",
          "Google / Microsoft buttons (enabled only when credentials exist in .env)",
          "On success → /onboarding/company (first login) or /dashboard",
          "Session + protected routes for everything under (app)",
        ]}
      />
    </>
  );
}
