"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { PUBLIC_NAV } from "@/lib/nav";

export function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-6">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-6 text-sm md:flex">
          {PUBLIC_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-fg-soft hover:text-fg">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden gap-2 md:flex">
          <ButtonLink href="/login" variant="outline">
            Sign In
          </ButtonLink>
          <ButtonLink href="/register">Get Started →</ButtonLink>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-fg-soft md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <nav aria-label="Mobile" className="flex flex-col gap-1 border-t border-line px-6 py-4 md:hidden">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-fg-soft hover:bg-surface-2"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-2">
            <ButtonLink href="/login" variant="outline" className="flex-1">
              Sign In
            </ButtonLink>
            <ButtonLink href="/register" className="flex-1">
              Get Started
            </ButtonLink>
          </div>
        </nav>
      )}
    </header>
  );
}
