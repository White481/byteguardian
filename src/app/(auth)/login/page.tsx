import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

// Figma frame "02 Login"
export default function LoginPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Sign in to continue your security assessment.</p>
      <LoginForm />
    </>
  );
}
