"use client";

import { cn } from "@/lib/cn";

export function SizePicker({
  sizes,
  selected,
  onSelect,
  disabled,
  unavailableSizes = [],
  labels = {},
}: {
  sizes: number[];
  selected: number | null;
  onSelect: (size: number) => void;
  disabled?: boolean;
  unavailableSizes?: number[];
  labels?: Record<number, string>;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Chọn size">
      {sizes.map((size) => {
        const unavailable = disabled || unavailableSizes.includes(size);
        return (
        <button
          key={size}
          type="button"
          role="radio"
          aria-checked={selected === size}
          disabled={unavailable}
          aria-label={`Size ${labels[size] ?? size}${unavailable ? " — Hết hàng" : ""}`}
          onClick={() => onSelect(size)}
          className={cn(
            "flex min-h-11 min-w-11 max-w-full items-center justify-center whitespace-normal break-words rounded-lg border px-3 py-2 text-sm tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-brand motion-reduce:transition-none",
            unavailable
              ? "cursor-not-allowed border-ink-700 text-fg-subtle line-through"
              : selected === size
                ? "border-brand bg-brand/15 text-brand"
                : "border-ink-700 text-fg-muted hover:text-fg",
          )}
        >
          {labels[size] ?? size}
        </button>
      ); })}
    </div>
  );
}
