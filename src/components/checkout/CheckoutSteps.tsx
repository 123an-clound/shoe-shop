import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function CheckoutSteps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mb-8 flex items-center gap-2">
      {steps.map((label, i) => (
        <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
              i <= current ? "bg-brand text-ink-950" : "bg-ink-800 text-fg-subtle",
            )}
          >
            {i < current ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
          </span>
          <span className={cn("text-xs", i === current ? "text-fg" : "text-fg-subtle")}>
            {label}
          </span>
          {i < steps.length - 1 && <span className="h-px flex-1 bg-ink-700" />}
        </li>
      ))}
    </ol>
  );
}
