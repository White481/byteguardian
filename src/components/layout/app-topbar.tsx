"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { SEGMENT_LABELS } from "@/lib/nav";

/** Search, notifications and user profile across the top of every app page */
export function AppTopbar() {
  return (
    <header className="flex h-18 items-center justify-between gap-4 border-b border-line px-6">
      <label className="flex h-10 w-full max-w-sm items-center gap-2 rounded-lg border border-line bg-surface px-3 text-subtle">
        <Search className="size-4" />
        {/* TODO: wire to a search endpoint */}
        <input
          type="search"
          placeholder="Search…"
          aria-label="Search"
          className="w-full bg-transparent text-sm text-fg placeholder:text-subtle focus:outline-none"
        />
      </label>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-11 items-center justify-center rounded-lg border border-line bg-surface text-fg-soft hover:text-fg"
        >
          <Bell className="size-4" />
          <span className="absolute top-2.5 right-3 size-2 rounded-full bg-danger" />
        </button>
        {/* TODO(ตัง): read name/initials from the session */}
        <div className="flex items-center gap-2 text-sm">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold">
            PS
          </span>
          <span className="hidden sm:inline">[User name]</span>
        </div>
      </div>
    </header>
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
