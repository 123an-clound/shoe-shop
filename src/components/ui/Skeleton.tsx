import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-[var(--radius-card)] bg-ink-800", className)}
      aria-hidden="true"
    />
  );
}
