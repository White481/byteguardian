import { Construction } from "lucide-react";
import { Card, CardBody } from "./card";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/**
 * Temporary placeholder for pages that a teammate has not built yet.
 * Delete it from the page when you start implementing.
 */
export function PagePlaceholder({
  owner,
  todo,
  reference,
}: {
  owner: string;
  todo: string[];
  reference?: string;
}) {
  return (
    <Card className="border-dashed">
      <CardBody>
        <div className="mb-3 flex items-center gap-2 text-warning">
          <Construction className="size-5" />
          <span className="font-semibold">Not built yet — owner: {owner}</span>
        </div>
        <ul className="list-inside list-disc space-y-1 text-sm text-muted">
          {todo.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {reference && <p className="mt-3 text-xs text-subtle">Reference: {reference}</p>}
      </CardBody>
    </Card>
  );
}
