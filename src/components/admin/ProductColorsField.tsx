"use client";

import { Plus, X } from "lucide-react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import type { ProductFormValues } from "@/lib/validation/product";

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
          <div key={field.id} className="flex items-center gap-2">
            <input
              type="color"
              {...form.register(`colors.${index}.hex` as const)}
              className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border border-ink-700 bg-ink-900 p-1"
              aria-label={`Mã màu dòng ${index + 1}`}
            />
            <Input
              className="flex-1"
              placeholder="Tên màu, ví dụ: Đen Tuyền"
              {...form.register(`colors.${index}.name` as const)}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label="Xóa màu"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-fg-subtle hover:text-fg"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ name: "", hex: "#8b5cf6" })}
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
