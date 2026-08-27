"use client";

import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { slugify } from "@/lib/slugify";
import type { ProductFormValues } from "@/lib/validation/product";
import type { Category } from "@/lib/queries/categories";

export function ProductBasicFields({
  form,
  categories,
  slugTouched,
  setSlugTouched,
}: {
  form: UseFormReturn<ProductFormValues>;
  categories: Category[];
  slugTouched: boolean;
  setSlugTouched: (touched: boolean) => void;
}) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const slug = watch("slug");
  const originalPrice = watch("originalPrice");

  function handleNameChange(value: string) {
    setValue("name", value);
    if (!slugTouched) setValue("slug", slugify(value));
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Tên sản phẩm"
          value={watch("name")}
          onChange={(e) => handleNameChange(e.target.value)}
          error={errors.name?.message}
        />
        <Input
          label="Slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setValue("slug", e.target.value);
          }}
          error={errors.slug?.message}
        />
      </div>

      <div>
        <label className="text-sm text-fg-muted">Danh mục</label>
        <select
          {...register("categoryId")}
          className="mt-1.5 h-11 w-full rounded-lg border border-ink-700 bg-ink-900 px-4 text-sm text-fg focus:border-brand focus:outline-none"
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-xs text-red-400">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Giá bán (₫)"
          type="number"
          {...register("price", { valueAsNumber: true })}
          error={errors.price?.message}
        />
        <Input
          label="Giá gốc (₫) — để trống nếu không giảm"
          type="number"
          value={originalPrice ?? ""}
          onChange={(e) =>
            setValue("originalPrice", e.target.value === "" ? null : Number(e.target.value))
          }
          error={errors.originalPrice?.message}
        />
      </div>

      <div>
        <label className="text-sm text-fg-muted">Mô tả</label>
        <textarea
          rows={4}
          {...register("description")}
          className="mt-1.5 w-full rounded-lg border border-ink-700 bg-ink-900 px-4 py-3 text-sm text-fg focus:border-brand focus:outline-none"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>
        )}
      </div>
    </>
  );
}
