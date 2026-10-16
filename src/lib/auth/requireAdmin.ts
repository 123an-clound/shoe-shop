import { createClient } from "@/lib/supabase/server";
import { PublicError, safeErrorMessage } from "@/lib/security/errors";
import { securityEvent } from "@/lib/security/events";

/**
 * Kiểm tra quyền admin ngay trong Server Action, không dựa hoàn toàn vào RLS
 * (mục 5.7/9 PLAN.md — "RLS là lớp chặn cuối, không phải lớp duy nhất").
 * Ném lỗi tiếng Việt để action gọi nó tự bắt và trả về cho client.
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    securityEvent("access_denied", "NO_SESSION");
    throw new PublicError("Chưa đăng nhập.");
  }

  const { data: admin } = await supabase
    .from("veloce_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    securityEvent("access_denied", "NOT_ADMIN");
    throw new PublicError("Tài khoản không có quyền quản trị.");
  }

  return { supabase, user };
}

export function actionErrorMessage(error: unknown): string {
  return safeErrorMessage(error);
}
