"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { VideoUploader } from "@/components/admin/VideoUploader";
import { ProductBasicFields } from "@/components/admin/ProductBasicFields";
import { ProductFeaturesField } from "@/components/admin/ProductFeaturesField";
import { ProductSizesField } from "@/components/admin/ProductSizesField";
import { ProductSizeGuideField } from "@/components/admin/ProductSizeGuideField";
import { ProductColorsField } from "@/components/admin/ProductColorsField";
import { ProductMetaFields } from "@/components/admin/ProductMetaFields";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { productFormSchema, type ProductFormValues } from "@/lib/validation/product";
import type { Category } from "@/lib/queries/categories";
import type { Product } from "@/lib/queries/products";
import type { ProductColor } from "@/types";
import { getSizeGuide } from "@/lib/sizeGuide";

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product;
}) {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(!!product);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

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
          sizeGuide: getSizeGuide(product.size_guide),
          colors: product.colors as ProductColor[],
          badge: product.badge as ProductFormValues["badge"],
          stock: product.stock,
          isPublished: product.is_published,
          images: product.images,
          videoUrl: product.video_url ?? null,
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
          sizeGuide: getSizeGuide(null),
          colors: [],
          badge: null,
          stock: 0,
          isPublished: false,
          images: [],
          videoUrl: null,
        },
  });

  const {
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const slug = useWatch({ control: form.control, name: "slug" });
  const images = useWatch({ control: form.control, name: "images" });
  const videoUrl = useWatch({ control: form.control, name: "videoUrl" });
  const featuresEn = useWatch({ control: form.control, name: "featuresEn" });

  async function onSubmit(values: ProductFormValues) {
    if (uploadingImages || uploadingVideo) return;
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
        <label htmlFor="product-features-en" className="text-sm text-fg-muted">Features (English, one per line)</label>
        <textarea id="product-features-en" rows={4} value={featuresEn.join("\n")} onChange={(event) => setValue("featuresEn", event.target.value.split("\n").filter(Boolean), { shouldDirty: true })} className="w-full rounded-lg border border-ink-700 bg-ink-900 px-4 py-3 text-sm text-fg focus:border-brand focus:outline-none" />
      </div>
      <ProductSizesField form={form} />
      <ProductSizeGuideField form={form} />
      <ProductColorsField form={form} />
      <ProductMetaFields form={form} />

      <div>
        <label className="text-sm text-fg-muted">Ảnh sản phẩm</label>
        <div className="mt-2">
          <ImageUploader slug={slug} value={images} onChange={(urls) => setValue("images", urls, { shouldDirty: true, shouldValidate: true })} onUploadingChange={setUploadingImages} />
        </div>
        {errors.images && <p className="mt-1 text-xs text-red-400">{errors.images.message}</p>}
      </div>

      <VideoUploader slug={slug} value={videoUrl} onChange={(url) => setValue("videoUrl", url, { shouldDirty: true, shouldValidate: true })} onUploadingChange={setUploadingVideo} />
      {errors.videoUrl && <p role="alert" className="text-sm text-red-400">{errors.videoUrl.message}</p>}

      <Button type="submit" disabled={isSubmitting || uploadingImages || uploadingVideo} className="self-start">
        {isSubmitting ? "Đang lưu..." : uploadingImages || uploadingVideo ? "Đang tải tệp..." : product ? "Lưu thay đổi" : "Tạo sản phẩm"}
      </Button>
    </form>
  );
}
