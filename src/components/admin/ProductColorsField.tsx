"use client";

import { Plus, X } from "lucide-react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import type { ProductFormValues } from "@/lib/validation/product";
import { hasVariantInventory } from "@/lib/productVariants";

export function ProductColorsField({ form }: { form: UseFormReturn<ProductFormValues> }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "colors",
  });

  return (
    <div>
      <label className="text-sm text-fg-muted">Màu sắc</label>
      <div className="mt-2 flex flex-col gap-2">
        {fields.map((field, index) => (
          <div key={field.id}>
          <div className="flex items-center gap-2">
            <input
              type="color"
              {...form.register(`colors.${index}.hex` as const)}
              className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border border-ink-700 bg-ink-900 p-1"
              aria-label={`Mã màu dòng ${index + 1}`}
            />
            <div className="min-w-0 flex-1"><Input
              aria-label={`Tên màu dòng ${index + 1}`}
              className="w-full"
              placeholder="Tên màu, ví dụ: Đen Tuyền"
              {...form.register(`colors.${index}.name` as const)}
              error={form.formState.errors.colors?.[index]?.name?.message}
            /></div>
            <button
              type="button"
              onClick={() => {
                const color = form.getValues(`colors.${index}`);
                if (color.inventory?.some((entry) => entry.quantity > 0) && !window.confirm(`Xóa màu ${color.name} sẽ xóa tồn kho của màu này. Tiếp tục?`)) return;
                remove(index);
              }}
              aria-label="Xóa màu"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-fg-subtle hover:text-fg"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {form.formState.errors.colors?.[index]?.hex && <p role="alert" className="mt-1 text-sm text-red-400">{form.formState.errors.colors[index]?.hex?.message}</p>}
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            const colors = form.getValues("colors");
            const tracked = !colors.length || hasVariantInventory(colors);
            const used = new Set(colors.map((color) => color.hex.toLowerCase()));
            let hex = "#8b5cf6";
            for (let value = 0; used.has(hex); value++) hex = `#${value.toString(16).padStart(6, "0")}`;
            append({ name: "", hex, image: null, ...(tracked ? { inventory: form.getValues("sizes").map((size) => ({ size, quantity: 0 })) } : {}) });
          }}
          className="flex items-center gap-1.5 self-start text-sm text-brand hover:underline"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Thêm màu
        </button>
      </div>
      {form.formState.errors.colors && (
        <p className="mt-1 text-xs text-red-400">
          {form.formState.errors.colors.message as string}
        </p>
      )}
    </div>
  );
}
