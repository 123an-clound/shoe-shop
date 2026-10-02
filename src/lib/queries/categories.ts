import { unstable_cache } from "next/cache";
import { supabasePublic } from "@/lib/supabase/public";
import type { Tables } from "@/types/database";

export type Category = Tables<"veloce_categories">;

export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const { data, error } = await supabasePublic
      .from("veloce_categories")
      .select("*")
      .order("sort_order");

    if (error) throw new Error("Không đọc được danh mục.");
    return data;
  },
  ["veloce-categories-v2"],
  { tags: ["categories"] },
);
