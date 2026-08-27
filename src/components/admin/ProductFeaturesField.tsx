"use client";

import { Plus, X } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import type { ProductFormValues } from "@/lib/validation/product";

/**
 * Danh sách chuỗi đơn giản (text[] trong DB) — không dùng useFieldArray vì
 * RHF chỉ hỗ trợ kiểu mảng-object cho field array, quản lý trực tiếp bằng
 * watch/setValue giống ProductSizesField.
 */
export function ProductFeaturesField({ form }: { form: UseFormReturn<ProductFormValues> }) {
  const features = form.watch("features");

  function updateAt(index: number, value: string) {
    const next = [...features];
    next[index] = value;
    form.setValue("features", next);
  }

  function removeAt(index: number) {
    form.setValue(
      "features",
      features.filter((_, i) => i !== index),
      { shouldValidate: true },
    );
  }

  function addRow() {
    form.setValue("features", [...features, ""]);
  }

  return (
    <div>
      <label className="text-sm text-fg-muted">Thông số</label>
      <div className="mt-2 flex flex-col gap-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              className="flex-1"
              value={feature}
              onChange={(e) => updateAt(index, e.target.value)}
              placeholder="Ví dụ: Đế cao su đúc nguyên khối"
            />
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label="Xóa dòng thông số"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-fg-subtle hover:text-fg"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1.5 self-start text-sm text-brand hover:underline"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Thêm dòng
        </button>
      </div>
      {form.formState.errors.features && (
        <p className="mt-1 text-xs text-red-400">
          {form.formState.errors.features.message as string}
        </p>
      )}
    </div>
  );
}
