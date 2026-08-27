import { createClient } from "@/lib/supabase/server";

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
    throw new Error("Chưa đăng nhập.");
  }

  const { data: admin } = await supabase
    .from("veloce_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    throw new Error("Tài khoản không có quyền quản trị.");
  }

  return { supabase, user };
}

export function actionErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại.";
}
