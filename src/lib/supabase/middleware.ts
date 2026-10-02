import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

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
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/dang-nhap";

  if (isAdminRoute && !isLoginRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dang-nhap";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
