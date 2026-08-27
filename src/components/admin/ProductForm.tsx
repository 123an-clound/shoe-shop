"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
          slug: product.slug,
          categoryId: product.category_id ?? "",
          price: product.price,
          originalPrice: product.original_price,
          description: product.description,
          features: product.features,
          sizes: product.sizes,
          colors: product.colors as ProductColor[],
          badge: product.badge as ProductFormValues["badge"],
          stock: product.stock,
          isPublished: product.is_published,
          images: product.images,
        }
      : {
          name: "",
          slug: "",
          categoryId: "",
          price: 0,
          originalPrice: null,
          description: "",
          features: [],
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
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const slug = watch("slug");
  const images = watch("images");

  async function onSubmit(values: ProductFormValues) {
    const result = product
      ? await updateProduct(product.id, values)
      : await createProduct(values);

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
