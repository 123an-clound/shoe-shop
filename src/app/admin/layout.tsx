import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { AdminThemeProvider } from "@/components/admin/AdminThemeProvider";
import { ADMIN_THEME_COOKIE, getAdminTheme } from "@/lib/adminTheme";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  return <AdminThemeProvider initialTheme={getAdminTheme(cookieStore.get(ADMIN_THEME_COOKIE)?.value)}>{children}</AdminThemeProvider>;
}
