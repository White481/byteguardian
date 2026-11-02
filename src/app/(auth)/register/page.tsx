import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create account" };

// Figma frame "03 Register"
export default function RegisterPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">Create account</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Start assessing your cybersecurity maturity in minutes.</p>
      <RegisterForm />
    </>
  );
}
