import { cn } from "@/lib/utils";
import { Card } from "./card";

/** Summary card used on Dashboard / Results (Current Tier, Target Tier, Gap, Risk) */
export function StatCard({
  label,
  value,
  suffix,
  icon,
  footer,
  accent = "primary",
}: {
  label: string;
  value: React.ReactNode;
  suffix?: string;
  icon: React.ReactNode;
  footer?: React.ReactNode;
  accent?: "primary" | "violet" | "warning" | "success" | "danger";
}) {
  const accents = {
    primary: "bg-primary/20 text-accent",
    violet: "bg-violet/15 text-violet",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/15 text-success",
    danger: "bg-danger/15 text-danger",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", accents[accent])}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-1 text-3xl font-bold text-fg">
            {value}
            {suffix && <span className="ml-1 text-lg font-medium text-subtle">{suffix}</span>}
          </p>
          {footer && <div className="mt-2">{footer}</div>}
        </div>
      </div>
    </Card>
  );
}
