"use client";

import type { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { getSizeLabel } from "@/lib/sizeLabels";
import { cn } from "@/lib/cn";
import { AVAILABLE_SIZES, type ProductFormValues } from "@/lib/validation/product";

export function ProductSizesField({ form }: { form: UseFormReturn<ProductFormValues> }) {
  const sizes = form.watch("sizes");
  const sizeGuide = form.watch("sizeGuide");
  const [customSize, setCustomSize] = useState("");
  const choices = [...new Set([...AVAILABLE_SIZES, ...sizes, ...sizeGuide.map((row) => row.size)])].filter((size) => size >= 1 && size <= 60).sort((a, b) => a - b);

  function toggle(size: number) {
    const colors = form.getValues("colors");
    if (sizes.includes(size) && colors.some((color) => (color.inventory?.find((entry) => entry.size === size)?.quantity ?? 0) > 0) &&
        !window.confirm(`Bỏ size ${size} sẽ xóa tồn kho của size này ở tất cả màu. Tiếp tục?`)) return;
    const next = sizes.includes(size)
      ? sizes.filter((s) => s !== size)
      : [...sizes, size].sort((a, b) => a - b);
    form.setValue("sizes", next, { shouldDirty: true });
    colors.forEach((color, index) => {
      if (color.inventory) form.setValue(`colors.${index}.inventory`, next.map((currentSize) => ({ size: currentSize, quantity: color.inventory?.find((entry) => entry.size === currentSize)?.quantity ?? 0 })), { shouldDirty: true });
    });
    void form.trigger(["sizes", "colors"]);
  }

  return (
    <div>
      <label className="text-sm text-fg-muted">Size (EU)</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {choices.map((size) => {
          const selected = sizes.includes(size);
          return (
            <button
              key={size}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(size)}
              className={cn(
                "flex min-h-11 min-w-11 max-w-full items-center justify-center break-words rounded-lg border px-3 py-2 text-sm tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-brand motion-reduce:transition-none",
                selected
                  ? "border-brand bg-brand/15 text-brand"
                  : "border-ink-700 text-fg-muted hover:text-fg",
              )}
            >
              {getSizeLabel(sizeGuide, size)}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <Input label="Thêm size" type="number" min={1} max={60} step={1} value={customSize} onChange={(event) => setCustomSize(event.target.value)} />
        <button type="button" disabled={!Number.isInteger(Number(customSize)) || Number(customSize) < 1 || Number(customSize) > 60 || sizes.includes(Number(customSize))} onClick={() => { toggle(Number(customSize)); setCustomSize(""); }} className="min-h-11 shrink-0 rounded-lg border border-ink-700 px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-40">Thêm size</button>
      </div>
      {form.formState.errors.sizes && (
        <p className="mt-1 text-xs text-red-400">{form.formState.errors.sizes.message}</p>
      )}
    </div>
  );
}
