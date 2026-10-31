"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { APP_NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** Persistent dark sidebar for authenticated pages */
export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

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
        {/* TODO(ตัง): call the real sign-out action when auth is ready */}
        <Link
          href="/"
          className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm text-fg-soft hover:bg-surface-2 hover:text-fg"
        >
          <LogOut className="size-4" />
          Logout
        </Link>
      </nav>

      <div className="mt-auto rounded-xl border border-line bg-gradient-to-br from-surface-2 to-surface-3 p-4">
        <p className="text-sm font-bold text-fg">Upgrade to Enterprise</p>
        <p className="mt-1 text-xs text-muted">Unlock advanced features.</p>
        <Link href="/#pricing" className="mt-3 inline-block text-sm font-semibold text-accent">
          View plans →
        </Link>
      </div>
    </aside>
  );
}
