import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const LOCALES = ["en", "vi"] as const;

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const parts = pathname.split("/").filter(Boolean);
  const hasLocale = LOCALES.includes(parts[0] as (typeof LOCALES)[number]);
  const locale = parts[0] === "en" ? "en" : "vi";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-velo-locale", locale);

  const response = await updateSession(request, requestHeaders);
  if (response.headers.has("location")) return response;

  if (pathname === "/vi" || pathname.startsWith("/vi/")) {
    const canonical = request.nextUrl.clone();
    canonical.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(canonical, 308);
  }

  const rootFile = ["/robots.txt", "/sitemap.xml", "/opengraph-image"].includes(pathname);
  const isAdminOrApi = pathname.startsWith("/admin") || pathname.startsWith("/api");
  if (hasLocale || isAdminOrApi || rootFile) return response;

  const destination = request.nextUrl.clone();
  destination.pathname = `/vi${pathname === "/" ? "" : pathname}`;
  const rewrite = NextResponse.rewrite(destination, { request: { headers: requestHeaders } });
  for (const cookie of response.cookies.getAll()) rewrite.cookies.set(cookie);
  return rewrite;
}

export const config = {
  matcher: [
    /*
     * Chạy trên mọi đường dẫn trừ static asset và ảnh tối ưu,
     * để session Supabase luôn được refresh.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
