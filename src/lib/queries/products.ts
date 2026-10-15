import { unstable_cache } from "next/cache";
import { supabasePublic } from "@/lib/supabase/public";
import type { Tables } from "@/types/database";

export type Product = Tables<"veloce_products">;
const summaryColumns = "id,slug,name,name_en,brand,category_id,price,original_price,images,badge,rating,review_count,stock,sizes,colors,is_published,sort_order,created_at,updated_at" as const;
export type ProductSummary = Pick<Product, "id" | "slug" | "name" | "name_en" | "brand" | "category_id" | "price" | "original_price" | "images" | "badge" | "rating" | "review_count" | "stock" | "sizes" | "colors" | "is_published" | "sort_order" | "created_at" | "updated_at">;

export const getProducts = unstable_cache(
  async (): Promise<ProductSummary[]> => {
    const { data, error } = await supabasePublic
      .from("veloce_products")
      .select(summaryColumns)
      .eq("is_published", true)
      .order("sort_order");

    if (error) throw new Error("Không đọc được danh sách sản phẩm.");
    return data;
  },
  ["veloce-products-summary-v3", process.env.NEXT_PUBLIC_SUPABASE_URL!],
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
  ["veloce-product-by-slug-v2", process.env.NEXT_PUBLIC_SUPABASE_URL!],
  { tags: ["products"] },
);

export const getRelatedProducts = unstable_cache(
  async (categoryId: string, excludeSlug: string, limit = 4): Promise<ProductSummary[]> => {
    const { data, error } = await supabasePublic
      .from("veloce_products")
      .select(summaryColumns)
      .eq("is_published", true)
      .eq("category_id", categoryId)
      .neq("slug", excludeSlug)
      .order("sort_order")
      .limit(limit);

    if (error) throw new Error("Không đọc được sản phẩm liên quan.");
    return data;
  },
  ["veloce-related-products-summary-v3", process.env.NEXT_PUBLIC_SUPABASE_URL!],
  { tags: ["products"] },
);
