import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { authCookieOptions, hardenAuthCookie } from "@/lib/security/cookies";

/**
 * Refresh session Supabase trên mỗi request, và chặn /admin/* (trừ trang đăng nhập)
 * khi chưa đăng nhập. Việc kiểm tra có phải admin (bảng veloce_admins) hay không
 * nằm ở trang /admin/dang-nhap, không nằm ở đây.
 */
export async function updateSession(request: NextRequest, forwardedHeaders = request.headers) {
  const nextResponse = () => NextResponse.next({ request: { headers: forwardedHeaders } });
  let supabaseResponse = nextResponse();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: authCookieOptions(),
      global: { headers: process.env.VELOCE_SECURITY_KEY ? { "x-veloce-server-token": process.env.VELOCE_SECURITY_KEY } : {} },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = nextResponse();
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, hardenAuthCookie(options)),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let activeUser = user;
  if (user) {
    const { data: active, error } = await supabase.rpc("veloce_touch_session");
    if (!error && active === false) {
      await supabase.auth.signOut({ scope: "local" });
      activeUser = null;
    }
    if (error) activeUser = null; // Không đăng xuất do sự cố tạm thời; endpoint vẫn fail closed.
  }

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/dang-nhap";

  if (isAdminRoute && !isLoginRoute && !activeUser) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dang-nhap";
    const redirect = NextResponse.redirect(url);
    for (const cookie of supabaseResponse.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }

  return supabaseResponse;
}
