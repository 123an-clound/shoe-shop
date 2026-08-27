import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  hint,
  emphasize,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasize?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-ink-700 bg-ink-900 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-fg-muted">{label}</p>
        {icon}
      </div>
      <p
        className={cn(
          "mt-2 font-display font-bold tabular-nums text-fg",
          emphasize ? "text-4xl" : "text-2xl",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-fg-subtle">{hint}</p>}
    </div>
  );
}
