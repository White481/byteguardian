import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** A large selectable option (radio-like). Use inside a role="radiogroup" container. */
export function ChoiceCard({
  selected,
  disabled,
  onSelect,
  title,
  description,
  meta,
  icon,
  className,
}: {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "relative flex w-full flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected ? "border-primary bg-primary/10 shadow-glow" : "border-line bg-surface-2 hover:border-line-strong",
        className,
      )}
    >
      {selected && <CheckCircle2 className="absolute top-3 right-3 size-5 text-accent" aria-hidden />}
      {icon && <span className="text-accent">{icon}</span>}
      <span className="pr-6 font-semibold text-fg">{title}</span>
      {description && <span className="text-sm text-muted">{description}</span>}
      {meta && <span className="text-xs text-subtle">{meta}</span>}
    </button>
  );
}
