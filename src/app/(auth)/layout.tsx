import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { getSessionUser } from "@/server/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Already signed in → skip login/register
  if (await getSessionUser()) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-wrap">
      <div className="bg-cyber-grid flex min-h-72 flex-[1_1_480px] flex-col justify-between border-r border-line bg-sidebar p-12">
        <Logo />
        <ShieldCheck className="mx-auto size-40 text-accent" strokeWidth={0.8} aria-hidden />
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assess. Improve. Secure.</h2>
          <p className="mt-2 text-muted">AI-powered cybersecurity maturity assessment.</p>
        </div>
      </div>
      <div className="flex flex-[1_1_420px] items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
