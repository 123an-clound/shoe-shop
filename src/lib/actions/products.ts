"use server";

import { revalidateTag } from "next/cache";
import { requireAdmin, actionErrorMessage } from "@/lib/auth/requireAdmin";
import { getSettings } from "@/lib/queries/settings";
import { productFormSchema, type ProductFormValues } from "@/lib/validation/product";

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
    slug: data.slug,
    brand,
    category_id: data.categoryId,
    price: data.price,
    original_price: data.originalPrice,
    description: data.description,
    features: data.features,
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

    revalidateTag("products", "max");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function updateProduct(productId: string, input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const data = parseProductForm(input);

    const { data: existing } = await supabase
      .from("veloce_products")
      .select("brand")
      .eq("id", productId)
      .single();

    const { error } = await supabase
      .from("veloce_products")
      .update(toRow(data, existing?.brand ?? ""))
      .eq("id", productId);
    if (error) throw new Error(error.message);

    revalidateTag("products", "max");
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
    const { error } = await supabase
      .from("veloce_products")
      .update({ is_published: isPublished })
      .eq("id", productId);
    if (error) throw new Error(error.message);

    revalidateTag("products", "max");
    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();

    const { data: product } = await supabase
      .from("veloce_products")
      .select("images")
      .eq("id", productId)
      .single();

    if (product?.images?.length) {
      const paths = product.images
        .map((url) => {
          const marker = "/object/public/veloce/";
          const idx = url.indexOf(marker);
          return idx === -1 ? null : url.slice(idx + marker.length);
        })
        .filter((path): path is string => !!path);

      if (paths.length > 0) {
        await supabase.storage.from("veloce").remove(paths);
      }
    }

    const { error } = await supabase.from("veloce_products").delete().eq("id", productId);
    if (error) throw new Error(error.message);

    revalidateTag("products", "max");
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

    const { error } = await supabase.storage
      .from("veloce")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from("veloce").getPublicUrl(path);
    return { success: true, url: data.publicUrl };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export type { ProductFormValues };
