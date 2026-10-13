"use client";

import type { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/cn";
import { AVAILABLE_SIZES, type ProductFormValues } from "@/lib/validation/product";

export function ProductSizesField({ form }: { form: UseFormReturn<ProductFormValues> }) {
  const sizes = form.watch("sizes");

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
        {AVAILABLE_SIZES.map((size) => {
          const selected = sizes.includes(size);
          return (
            <button
              key={size}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(size)}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-lg border text-sm tabular-nums transition-colors",
                selected
                  ? "border-brand bg-brand/15 text-brand"
                  : "border-ink-700 text-fg-muted hover:text-fg",
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
      {form.formState.errors.sizes && (
        <p className="mt-1 text-xs text-red-400">{form.formState.errors.sizes.message}</p>
      )}
    </div>
  );
}
