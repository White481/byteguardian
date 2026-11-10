"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { apiFetch } from "@/lib/api-client";
import { APP_NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** Persistent dark sidebar for authenticated pages */
export function AppSidebar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <aside
      className={cn(
        "flex w-64 shrink-0 flex-col gap-7 border-r border-line bg-sidebar px-4 py-6",
        className,
      )}
    >
      <Logo href="/dashboard" className="px-2" />

      <nav aria-label="App" className="flex flex-col gap-1">
        {APP_NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                active ? "bg-primary text-white" : "text-fg-soft hover:bg-surface-2 hover:text-fg",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="flex h-11 items-center gap-3 rounded-lg px-3 text-left text-sm text-fg-soft hover:bg-surface-2 hover:text-fg disabled:opacity-60"
        >
          {signingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
          Logout
        </button>
      </nav>

      <div className="mt-auto rounded-xl border border-line bg-gradient-to-br from-surface-2 to-surface-3 p-4">
        <p className="text-sm font-bold text-fg">Upgrade to Business</p>
        <p className="mt-1 text-xs text-muted">Unlimited re-assessments and an expert review.</p>
        <Link href="/#pricing" className="mt-3 inline-block text-sm font-semibold text-accent">
          View plans →
        </Link>
      </div>
    </aside>
  );
}
