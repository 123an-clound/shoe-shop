import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/queries/settings";
import { getPendingOrderCount } from "@/lib/queries/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

/**
 * Lớp bảo vệ thứ hai ngoài proxy.ts: proxy chỉ kiểm tra "đã đăng nhập chưa",
 * còn ở đây kiểm tra thêm "có phải admin không" (mục 5.7/9 PLAN.md).
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/dang-nhap");
  }

  const { data: admin } = await supabase
    .from("veloce_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    redirect("/admin/dang-nhap");
  }

  const [settings, pendingCount] = await Promise.all([getSettings(), getPendingOrderCount()]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar storeName={settings.store_name} hasPendingOrders={pendingCount > 0} />
      <main className="flex-1 overflow-x-hidden p-6 sm:p-8">{children}</main>
    </div>
  );
}
