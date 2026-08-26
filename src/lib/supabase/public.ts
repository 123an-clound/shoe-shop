import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Client anon dùng cho các truy vấn công khai có thể cache theo tag
 * (settings, categories, testimonials, products đã publish). Không đọc cookie
 * phiên đăng nhập nên dùng được bên trong `unstable_cache`.
 */
export const supabasePublic = createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
