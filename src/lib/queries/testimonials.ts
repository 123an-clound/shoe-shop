import { unstable_cache } from "next/cache";
import { supabasePublic } from "@/lib/supabase/public";
import type { Tables } from "@/types/database";

export type Testimonial = Tables<"veloce_testimonials">;

export const getTestimonials = unstable_cache(
  async (): Promise<Testimonial[]> => {
    const { data, error } = await supabasePublic
      .from("veloce_testimonials")
      .select("*")
      .eq("is_published", true)
      .order("sort_order");

    if (error) throw new Error("Không đọc được đánh giá khách hàng.");
    return data;
  },
  ["veloce-testimonials"],
  { tags: ["testimonials"] },
);
