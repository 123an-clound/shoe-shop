import { unstable_cache } from "next/cache";
import { supabasePublic } from "@/lib/supabase/public";
import type { Tables } from "@/types/database";

export type Product = Tables<"veloce_products">;

export const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const { data, error } = await supabasePublic
      .from("veloce_products")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");

    if (error) throw new Error("Không đọc được danh sách sản phẩm.");
    return data;
  },
  ["veloce-products"],
  { tags: ["products"] },
);

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    const { data, error } = await supabasePublic
      .from("veloce_products")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) throw new Error("Không đọc được sản phẩm.");
    return data;
  },
  ["veloce-product-by-slug"],
  { tags: ["products"] },
);

export const getRelatedProducts = unstable_cache(
  async (categoryId: string, excludeSlug: string, limit = 4): Promise<Product[]> => {
    const { data, error } = await supabasePublic
      .from("veloce_products")
      .select("*")
      .eq("is_published", true)
      .eq("category_id", categoryId)
      .neq("slug", excludeSlug)
      .order("sort_order")
      .limit(limit);

    if (error) throw new Error("Không đọc được sản phẩm liên quan.");
    return data;
  },
  ["veloce-related-products"],
  { tags: ["products"] },
);
