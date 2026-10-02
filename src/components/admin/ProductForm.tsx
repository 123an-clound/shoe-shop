"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ProductBasicFields } from "@/components/admin/ProductBasicFields";
import { ProductFeaturesField } from "@/components/admin/ProductFeaturesField";
import { ProductSizesField } from "@/components/admin/ProductSizesField";
import { ProductColorsField } from "@/components/admin/ProductColorsField";
import { ProductMetaFields } from "@/components/admin/ProductMetaFields";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { productFormSchema, type ProductFormValues } from "@/lib/validation/product";
import type { Category } from "@/lib/queries/categories";
import type { Product } from "@/lib/queries/products";
import type { ProductColor } from "@/types";

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product;
}) {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(!!product);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product
      ? {
          name: product.name,
          nameEn: product.name_en ?? "",
          slug: product.slug,
          categoryId: product.category_id ?? "",
          price: product.price,
          originalPrice: product.original_price,
          description: product.description,
          descriptionEn: product.description_en ?? "",
          features: product.features,
          featuresEn: product.features_en ?? [],
          sizes: product.sizes,
          colors: product.colors as ProductColor[],
          badge: product.badge as ProductFormValues["badge"],
          stock: product.stock,
          isPublished: product.is_published,
          images: product.images,
        }
      : {
          name: "",
          nameEn: "",
          slug: "",
          categoryId: "",
          price: 0,
          originalPrice: null,
          description: "",
          descriptionEn: "",
          features: [],
          featuresEn: [],
          sizes: [],
          colors: [],
          badge: null,
          stock: 0,
          isPublished: false,
          images: [],
        },
  });

  const {
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const slug = useWatch({ control: form.control, name: "slug" });
  const images = useWatch({ control: form.control, name: "images" });
  const featuresEn = useWatch({ control: form.control, name: "featuresEn" });

  async function onSubmit(values: ProductFormValues) {
    if (product && product.slug !== values.slug) {
      const confirmed = window.confirm(`Slug thay đổi từ "${product.slug}" sang "${values.slug}" sẽ thay URL sản phẩm. Link cũ có thể không còn truy cập được. Bạn muốn tiếp tục?`);
      if (!confirmed) return;
    }

    let result;
    try {
      result = product
        ? await updateProduct(product.id, product.updated_at, values)
        : await createProduct(values);
    } catch {
      toast.error("Không kết nối được để lưu sản phẩm. Dữ liệu trên form vẫn được giữ lại.");
      return;
    }

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(product ? "Đã lưu thay đổi" : "Đã tạo sản phẩm mới");
    router.push("/admin/san-pham");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex max-w-2xl flex-col gap-6">
      <ProductBasicFields
        form={form}
        categories={categories}
        slugTouched={slugTouched}
        setSlugTouched={setSlugTouched}
      />

      <ProductFeaturesField form={form} />
      <div className="flex flex-col gap-2">
        <label className="text-sm text-fg-muted">Features (English, one per line)</label>
        <textarea rows={4} value={featuresEn.join("\n")} onChange={(event) => setValue("featuresEn", event.target.value.split("\n").filter(Boolean), { shouldDirty: true })} className="w-full rounded-lg border border-ink-700 bg-ink-900 px-4 py-3 text-sm text-fg focus:border-brand focus:outline-none" />
      </div>
      <ProductSizesField form={form} />
      <ProductColorsField form={form} />
      <ProductMetaFields form={form} />

      <div>
        <label className="text-sm text-fg-muted">Ảnh sản phẩm</label>
        <div className="mt-2">
          <ImageUploader slug={slug} value={images} onChange={(urls) => setValue("images", urls)} />
        </div>
        {errors.images && <p className="mt-1 text-xs text-red-400">{errors.images.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "Đang lưu..." : product ? "Lưu thay đổi" : "Tạo sản phẩm"}
      </Button>
    </form>
  );
}
