"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { checkAuthRate } from "@/lib/auth/rateLimit";
import { securityEvent } from "@/lib/security/events";

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
    const rate = await checkAuthRate(supabase, "admin-login", credentials.data.email);
    if (rate !== "allowed") return { success: false, error: rate === "limited" ? "Quá nhiều lần đăng nhập. Vui lòng chờ ít phút rồi thử lại." : "Không kết nối được với hệ thống đăng nhập. Hãy thử lại." };

    const { data, error } = await supabase.auth.signInWithPassword(credentials.data);
    if (error || !data.user) {
      securityEvent("auth_failure", "ADMIN_CREDENTIALS");
      return { success: false, error: "Email hoặc mật khẩu không đúng." };
    }

    const { data: admin, error: adminError } = await supabase
      .from("veloce_admins")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (adminError) {
      await supabase.auth.signOut({ scope: "local" });
      return { success: false, error: "Không kiểm tra được quyền quản trị. Hãy thử lại sau." };
    }

    if (!admin) {
      await supabase.auth.signOut({ scope: "local" });
      return { success: false, error: "Tài khoản không có quyền quản trị." };
    }

    securityEvent("auth_success", "ADMIN_LOGIN");
    return { success: true };
  } catch {
    return { success: false, error: "Không kết nối được với hệ thống đăng nhập. Hãy thử lại." };
  }
}

export async function signOutAdmin(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw new Error("Không thể kết thúc phiên đăng nhập.");
}
