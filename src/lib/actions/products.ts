"use server";

import { updateTag } from "next/cache";
import { requireAdmin, actionErrorMessage } from "@/lib/auth/requireAdmin";
import { getSettings } from "@/lib/queries/settings";
import { productFormSchema, type ProductFormValues } from "@/lib/validation/product";
import { validateUploadedImage } from "@/lib/validation/image";
import { z } from "zod";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export type UploadImageResult =
  | { success: true; url: string }
  | { success: false; error: string };

function parseProductForm(input: unknown) {
  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  }
  return parsed.data;
}

function toRow(data: ReturnType<typeof parseProductForm>, brand: string) {
  return {
    name: data.name,
    name_en: data.nameEn || null,
    slug: data.slug,
    brand,
    category_id: data.categoryId,
    price: data.price,
    original_price: data.originalPrice,
    description: data.description,
    description_en: data.descriptionEn || null,
    features: data.features,
    features_en: data.featuresEn,
    sizes: data.sizes,
    colors: data.colors,
    badge: data.badge,
    stock: data.stock,
    is_published: data.isPublished,
    images: data.images,
  };
}

export async function createProduct(input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const data = parseProductForm(input);
    const settings = await getSettings();

    const { error } = await supabase.from("veloce_products").insert(toRow(data, settings.store_name));
    if (error) throw new Error(error.message);

    updateTag("products");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function updateProduct(productId: string, expectedUpdatedAt: string, input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!z.string().uuid().safeParse(productId).success || !z.string().datetime({ offset: true }).safeParse(expectedUpdatedAt).success) {
      throw new Error("Phiên bản sản phẩm không hợp lệ. Hãy tải lại trang.");
    }
    const data = parseProductForm(input);

    const { data: existing, error: readError } = await supabase
      .from("veloce_products")
      .select("brand, updated_at")
      .eq("id", productId)
      .maybeSingle();
    if (readError) throw new Error("Không tải được sản phẩm để sửa.");
    if (!existing) throw new Error("Sản phẩm không tồn tại hoặc đã bị xóa.");
    if (existing.updated_at !== expectedUpdatedAt) {
      throw new Error("Sản phẩm đã được sửa hoặc tồn kho vừa thay đổi. Tải lại để so sánh trước khi lưu.");
    }

    const { data: updated, error } = await supabase
      .from("veloce_products")
      .update(toRow(data, existing.brand))
      .eq("id", productId)
      .eq("updated_at", expectedUpdatedAt)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!updated) throw new Error("Sản phẩm vừa được thay đổi. Tải lại trang trước khi lưu tiếp.");

    updateTag("products");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function toggleProductPublish(
  productId: string,
  isPublished: boolean,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!z.string().uuid().safeParse(productId).success || typeof isPublished !== "boolean") {
      throw new Error("Dữ liệu xuất bản không hợp lệ.");
    }
    const { data, error } = await supabase
      .from("veloce_products")
      .update({ is_published: isPublished })
      .eq("id", productId)
      .eq("is_published", !isPublished)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Sản phẩm không tồn tại hoặc đã bị xóa.");

    updateTag("products");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function deleteProduct(productId: string, expectedUpdatedAt: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!z.string().uuid().safeParse(productId).success || !z.string().datetime({ offset: true }).safeParse(expectedUpdatedAt).success) throw new Error("Phiên bản sản phẩm không hợp lệ. Hãy tải lại trang.");
    const { data, error } = await supabase
      .from("veloce_products")
      .delete()
      .eq("id", productId)
      .eq("updated_at", expectedUpdatedAt)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Sản phẩm vừa được thay đổi hoặc đã bị xóa. Tải lại trang trước khi xóa.");

    updateTag("products");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function uploadProductImage(formData: FormData): Promise<UploadImageResult> {
  try {
    const { supabase } = await requireAdmin();

    const file = formData.get("file");
    const path = formData.get("path");
    if (!(file instanceof File) || typeof path !== "string") {
      throw new Error("Thiếu dữ liệu ảnh.");
    }
    if (!/^products\/[a-z0-9-]+-[1-3]-[a-f0-9-]{36}\.(png|jpg|jpeg|webp)$/.test(path)) {
      throw new Error("Đường dẫn ảnh sản phẩm không hợp lệ.");
    }
    const validationError = await validateUploadedImage(file, path);
    if (validationError) throw new Error(validationError);

    const { error } = await supabase.storage
      .from("veloce")
      .upload(path, file, { contentType: file.type });
    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from("veloce").getPublicUrl(path);
    return { success: true, url: data.publicUrl };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export type { ProductFormValues };
