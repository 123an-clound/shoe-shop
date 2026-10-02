"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export type SignInResult = { success: true } | { success: false; error: string };
const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(6).max(128),
});

/**
 * Đăng nhập xong kiểm tra có trong veloce_admins không; không có thì đăng
 * xuất ngay và báo lỗi (mục 5.7 PLAN.md).
 */
export async function signInAdmin(email: string, password: string): Promise<SignInResult> {
  try {
    const credentials = credentialsSchema.safeParse({ email, password });
    if (!credentials.success) return { success: false, error: "Email hoặc mật khẩu không hợp lệ." };

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword(credentials.data);
    if (error || !data.user) {
      return { success: false, error: "Email hoặc mật khẩu không đúng." };
    }

    const { data: admin, error: adminError } = await supabase
      .from("veloce_admins")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (adminError) {
      await supabase.auth.signOut();
      return { success: false, error: "Không kiểm tra được quyền quản trị. Hãy thử lại sau." };
    }

    if (!admin) {
      await supabase.auth.signOut();
      return { success: false, error: "Tài khoản không có quyền quản trị." };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Không kết nối được với hệ thống đăng nhập. Hãy thử lại." };
  }
}

export async function signOutAdmin(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("Không thể kết thúc phiên đăng nhập.");
}
