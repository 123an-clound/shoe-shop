"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ProductColor } from "@/types";

export function ColorPicker({
  colors,
  selected,
  onSelect,
}: {
  colors: ProductColor[];
  selected: string | null;
  onSelect: (hex: string) => void;
}) {
  const selectedColor = colors.find((c) => c.hex === selected);

  return (
    <div>
      <p className="text-sm text-fg-muted">
        Màu: <span className="text-fg">{selectedColor?.name ?? "Chọn màu"}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-3" role="radiogroup" aria-label="Chọn màu">
        {colors.map((color) => {
          const isSelected = color.hex === selected;
          return (
            <button
              key={color.hex}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={color.name}
              title={color.name}
              onClick={() => onSelect(color.hex)}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform",
                isSelected ? "scale-110 border-brand" : "border-transparent",
              )}
            >
              <span
                className="h-7 w-7 rounded-full border border-white/20"
                style={{ backgroundColor: color.hex }}
              />
              {isSelected && (
                <Check
                  className="absolute h-4 w-4 text-white mix-blend-difference"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
