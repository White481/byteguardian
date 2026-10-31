import { cn } from "@/lib/utils";
import type { Priority, RiskLevel } from "@/lib/types";

type Tone = "neutral" | "primary" | "cyan" | "violet" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-3 text-muted",
  primary: "bg-primary/20 text-accent",
  cyan: "bg-cyan/15 text-cyan",
  violet: "bg-violet/15 text-violet",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

const priorityTone: Record<Priority, Tone> = { high: "danger", medium: "warning", low: "primary" };
const riskTone: Record<RiskLevel, Tone> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "success",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge tone={priorityTone[priority]} className="capitalize">
      {priority} priority
    </Badge>
  );
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <Badge tone={riskTone[level]} className="capitalize">
      {level}
    </Badge>
  );
}

/** Marks data that is NOT real yet (required by project spec) */
export function MockBadge({ label = "Mock data" }: { label?: string }) {
  return (
    <Badge tone="warning" className="border border-warning/40 uppercase tracking-wide">
      {label}
    </Badge>
  );
}
