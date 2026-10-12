"use client";

import { Plus, X } from "lucide-react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import type { ProductFormValues } from "@/lib/validation/product";

export function ProductSizeGuideField({ form }: { form: UseFormReturn<ProductFormValues> }) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "sizeGuide" });
  const errors = form.formState.errors.sizeGuide;
  const message = errors?.root?.message ?? errors?.message;

  return (
    <fieldset className="min-w-0 rounded-lg border border-ink-700 p-4">
      <legend className="px-2 text-sm font-medium text-fg">Hướng dẫn chọn size</legend>
      <p className="mb-4 text-sm text-fg-muted">
        Bảng riêng cho sản phẩm này, hiển thị trên trang chi tiết. Nhập chiều dài bàn chân theo cm; bảng sẽ được sắp theo size khi hiển thị.
      </p>
      <div className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_2.75rem] items-start gap-2">
            <Input
              label="Size (EU)"
              aria-label={`Size EU dòng ${index + 1}`}
              type="number"
              min={1}
              max={60}
              step={1}
              className="min-w-0 w-full px-3"
              error={errors?.[index]?.size?.message}
              {...form.register(`sizeGuide.${index}.size`, { valueAsNumber: true })}
            />
            <Input
              label="Dài bàn chân (cm)"
              aria-label={`Chiều dài bàn chân dòng ${index + 1}`}
              type="number"
              min={0.1}
              max={50}
              step={0.1}
              className="min-w-0 w-full px-3"
              error={errors?.[index]?.cm?.message}
              {...form.register(`sizeGuide.${index}.cm`, { valueAsNumber: true })}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={`Xóa dòng hướng dẫn size ${index + 1}`}
              className="mt-7 flex h-11 w-11 items-center justify-center rounded-lg text-fg-muted hover:bg-ink-800 hover:text-red-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ size: 0, cm: 0 })}
          disabled={fields.length >= 60}
          className="flex min-h-11 items-center gap-1.5 self-start rounded-lg px-2 text-sm text-fg hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Thêm dòng hướng dẫn
        </button>
      </div>
      {message && <p role="alert" className="mt-2 text-sm text-red-400">{message}</p>}
    </fieldset>
  );
}
