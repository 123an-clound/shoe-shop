import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 đổi tên quy ước "Middleware" thành "Proxy" — chức năng giữ nguyên.
export async function proxy(request: NextRequest) {
  return updateSession(request);
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
