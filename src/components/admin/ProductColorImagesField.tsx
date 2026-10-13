"use client";

import Image from "next/image";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { ProductFormValues } from "@/lib/validation/product";

export function ProductColorImagesField({ form }: { form: UseFormReturn<ProductFormValues> }) {
  const colors = useWatch({ control: form.control, name: "colors" });
  const images = useWatch({ control: form.control, name: "images" });
  if (!colors.length) return null;

  return (
    <fieldset className="min-w-0 rounded-xl border border-ink-700 p-4">
      <legend className="px-2 text-sm font-semibold text-fg">Ảnh đại diện theo màu</legend>
      <p className="mb-4 text-sm text-fg-muted">Chọn ảnh trong bộ ảnh phía trên. Khách chọn màu nào sẽ thấy ảnh đại diện của màu đó.</p>
      <div className="flex flex-col gap-4">
        {colors.map((color, index) => (
          <div key={index} className="flex min-w-0 items-center gap-3">
            {color.image && images.includes(color.image) && <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-800"><Image src={color.image} alt={`Ảnh màu ${color.name}`} fill sizes="64px" className="object-cover" /></div>}
            <div className="min-w-0 flex-1">
              <label htmlFor={`color-image-${index}`} className="text-sm text-fg">{color.name || `Màu ${index + 1}`}</label>
              <select id={`color-image-${index}`} value={color.image ?? ""} disabled={!images.length}
                onChange={(event) => form.setValue(`colors.${index}.image`, event.target.value || null, { shouldDirty: true, shouldValidate: true })}
                className="mt-1.5 h-11 w-full rounded-lg border border-ink-700 bg-ink-900 px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50">
                <option value="">{images.length ? "Dùng ảnh đầu tiên" : "Tải ảnh sản phẩm lên trước"}</option>
                {images.map((url, imageIndex) => <option key={url} value={url}>Ảnh {imageIndex + 1}</option>)}
              </select>
              {form.formState.errors.colors?.[index]?.image && <p role="alert" className="mt-1 text-sm text-red-400">{form.formState.errors.colors[index]?.image?.message}</p>}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
