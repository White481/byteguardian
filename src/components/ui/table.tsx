import { cn } from "@/lib/utils";

/** Scrollable data table with the app's styling */
export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full min-w-[640px] border-collapse text-sm", className)} {...props} />
    </div>
  );
}

export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn("border-b border-line px-3 py-2.5 text-left text-xs font-medium tracking-wide text-subtle uppercase", className)}
      {...props}
    />
  );
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("border-b border-line/60 px-3 py-3 align-middle text-fg-soft", className)} {...props} />;
}
