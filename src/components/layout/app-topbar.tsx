"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useSession } from "@/components/session/session-provider";
import { SEGMENT_LABELS } from "@/lib/nav";
import { initials } from "@/lib/utils";
import { AppSidebar } from "./app-sidebar";

/** Mobile menu, company name and user profile across the top of every app page */
export function AppTopbar() {
  const user = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <>
      <header className="flex h-18 items-center justify-between gap-4 border-b border-line px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 text-fg-soft hover:bg-surface-2 lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-5" />
          </button>
          <p className="truncate text-sm text-muted">
            {user.companyName ?? "No company yet"}
          </p>
        </div>

        <Link href="/settings" className="flex items-center gap-2 text-sm hover:text-fg">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold">
            {initials(user.fullName)}
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span>{user.fullName}</span>
            <span className="text-xs text-subtle capitalize">{user.role}</span>
          </span>
        </Link>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <AppSidebar className="h-full overflow-y-auto" onNavigate={() => setMenuOpen(false)} />
          <button
            type="button"
            className="flex-1 bg-bg/70 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <X className="ml-auto mr-4 size-6 text-fg-soft" />
          </button>
        </div>
      )}
    </>
  );
}

/** Home › Section › Page, generated from the URL */
export function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-subtle">
      <Link href="/dashboard" className="hover:text-fg">
        Home
      </Link>
      {parts.map((part, i) => {
        const href = "/" + parts.slice(0, i + 1).join("/");
        const label = SEGMENT_LABELS[part] ?? part;
        const last = i === parts.length - 1;
        return (
          <span key={href}>
            {" › "}
            {last ? (
              <span className="text-fg-soft">{label}</span>
            ) : (
              <Link href={href} className="hover:text-fg">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
