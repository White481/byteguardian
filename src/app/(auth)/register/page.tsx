import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/page";

export const metadata: Metadata = { title: "Create account" };

// Owner: ตัง — Figma frame "03 Register"
export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Create account</h1>
      <PagePlaceholder
        owner="ตัง"
        reference='Figma frame "03 Register"'
        todo={[
          "Full name, work email, password, company name, company size",
          "Validation + duplicate email error",
          "Hash password (bcrypt/argon2) and create User + Company in the DB",
          "On success → /onboarding/company",
        ]}
      />
    </>
  );
}
