import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { authCookieOptions, hardenAuthCookie } from "@/lib/security/cookies";

/**
 * Dùng trong Server Component, Server Action, Route Handler.
 * Tạo mới mỗi request — không đưa ra biến toàn cục.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: authCookieOptions(),
      global: { headers: process.env.VELOCE_SECURITY_KEY ? { "x-veloce-server-token": process.env.VELOCE_SECURITY_KEY } : {} },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, hardenAuthCookie(options)),
            );
          } catch {
            // Bỏ qua khi gọi từ Server Component — middleware đã lo việc refresh session.
          }
        },
      },
    },
  );
}
