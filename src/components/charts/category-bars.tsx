import { ProgressBar } from "@/components/ui/feedback";
import type { CategoryScore } from "@/lib/types";

/** Horizontal tier bars per category (Tier Score by Category) */
export function CategoryBars({ data, maxTier = 4 }: { data: CategoryScore[]; maxTier?: number }) {
  return (
    <ul className="flex flex-col gap-3">
      {data.map((c) => (
        <li key={c.category}>
          <div className="mb-1 flex justify-between gap-2 text-sm">
            <span className="truncate text-fg-soft">
              <span className="text-subtle">{c.category}</span> {c.name}
            </span>
            <span className="font-semibold">{c.current.toFixed(1)}</span>
          </div>
          <ProgressBar value={(c.current / maxTier) * 100} />
        </li>
      ))}
    </ul>
  );
}
