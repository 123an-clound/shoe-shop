import { createClient as createPublicClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/** Chỉ public/signed Storage API. Auth tokens chỉ tồn tại trong cookie HttpOnly. */
export function createClient() {
  return createPublicClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
}
