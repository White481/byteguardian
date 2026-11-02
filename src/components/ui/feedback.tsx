import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-5 animate-spin text-primary", className)} />;
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-sm text-muted">
      <Spinner className="size-6" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
      <AlertTriangle className="size-8 text-danger" />
      <p className="text-sm text-muted">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center">
      <Inbox className="size-8 text-subtle" />
      <p className="font-medium text-fg">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-3", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-cyan transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const alertTones = {
  error: "border-danger/40 bg-danger/10 text-danger",
  success: "border-success/40 bg-success/10 text-success",
  info: "border-info/40 bg-info/10 text-info",
  warning: "border-warning/40 bg-warning/10 text-warning",
};

/** Inline message for form errors / success, announced to screen readers */
export function Alert({
  tone = "error",
  children,
  className,
}: {
  tone?: keyof typeof alertTones;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-lg border px-3 py-2 text-sm", alertTones[tone], className)}
    >
      {children}
    </div>
  );
}
