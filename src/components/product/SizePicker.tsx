"use client";

import { cn } from "@/lib/cn";

export function SizePicker({
  sizes,
  selected,
  onSelect,
  disabled,
}: {
  sizes: number[];
  selected: number | null;
  onSelect: (size: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Chọn size">
      {sizes.map((size) => (
        <button
          key={size}
          type="button"
          role="radio"
          aria-checked={selected === size}
          disabled={disabled}
          onClick={() => onSelect(size)}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-lg border text-sm tabular-nums transition-colors",
            disabled
              ? "cursor-not-allowed border-ink-700 text-fg-subtle line-through"
              : selected === size
                ? "border-brand bg-brand/15 text-brand"
                : "border-ink-700 text-fg-muted hover:text-fg",
          )}
        >
          {size}
        </button>
      ))}
    </div>
  );
}
