"use client";

import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { PRODUCT_BADGES, type ProductFormValues } from "@/lib/validation/product";

const BADGE_LABEL: Record<string, string> = {
  NEW: "Mới",
  SALE: "Giảm giá",
  HOT: "Bán chạy",
  LIMITED: "Giới hạn",
};

export function ProductMetaFields({ form }: { form: UseFormReturn<ProductFormValues> }) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const badge = watch("badge");

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm text-fg-muted">Nhãn</label>
          <select
            value={badge ?? ""}
            onChange={(e) =>
              setValue(
                "badge",
                e.target.value === "" ? null : (e.target.value as ProductFormValues["badge"]),
              )
            }
            className="mt-1.5 h-11 w-full rounded-lg border border-ink-700 bg-ink-900 px-4 text-sm text-fg focus:border-brand focus:outline-none"
          >
            <option value="">Không có</option>
            {PRODUCT_BADGES.map((b) => (
              <option key={b} value={b}>
                {BADGE_LABEL[b]}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Tồn kho"
          type="number"
          {...register("stock", { valueAsNumber: true })}
          error={errors.stock?.message}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-fg-muted">
        <input type="checkbox" {...register("isPublished")} className="accent-brand" />
        Hiển thị công khai (publish)
      </label>
    </>
  );
}
