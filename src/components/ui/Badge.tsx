import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type Tone = "lime" | "brand" | "muted";

const tones: Record<Tone, string> = {
  lime: "border border-neon-lime/30 bg-neon-lime/15 text-neon-lime",
  brand: "border border-brand/30 bg-brand/15 text-brand",
  muted: "border border-white/10 bg-white/5 text-fg-muted",
};

export function Badge({
  tone = "lime",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tabular-nums",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
