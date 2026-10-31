import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold text-fg", className)}>
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/20 text-accent ring-1 ring-accent/40">
        <ShieldCheck className="size-5" />
      </span>
      <span className="text-lg tracking-tight">ByteGuardian</span>
    </Link>
  );
}
