"use server";

import { createClient } from "@/lib/supabase/server";
import { actionErrorMessage } from "@/lib/auth/requireAdmin";

export type SignInResult = { success: true } | { success: false; error: string };

/**
 * Đăng nhập xong kiểm tra có trong veloce_admins không; không có thì đăng
 * xuất ngay và báo lỗi (mục 5.7 PLAN.md).
 */
export async function signInAdmin(email: string, password: string): Promise<SignInResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { success: false, error: "Email hoặc mật khẩu không đúng." };
    }

    const { data: admin } = await supabase
      .from("veloce_admins")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (!admin) {
      await supabase.auth.signOut();
      return { success: false, error: "Tài khoản không có quyền quản trị." };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }
}

export async function signOutAdmin(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
