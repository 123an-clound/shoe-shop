"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { signOutAdmin } from "@/lib/actions/auth";
import { toast } from "sonner";

const NAV_ITEMS = [
  { href: "/admin", label: "Bảng điều khiển", icon: LayoutDashboard },
  { href: "/admin/san-pham", label: "Sản phẩm", icon: Package },
  { href: "/admin/danh-muc", label: "Danh mục", icon: Tag },
  { href: "/admin/don-hang", label: "Đơn hàng", icon: ShoppingCart },
  { href: "/admin/hop-thu", label: "Hộp thư", icon: Mail },
  { href: "/admin/danh-gia", label: "Đánh giá", icon: Star },
  { href: "/admin/cai-dat", label: "Cài đặt", icon: Settings },
];

export function AdminSidebar({
  storeName,
  hasPendingOrders,
}: {
  storeName: string;
  hasPendingOrders: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await signOutAdmin();
      router.push("/admin/dang-nhap");
      router.refresh();
    } catch {
      toast.error("Không thể đăng xuất do lỗi kết nối. Hãy thử lại.");
    }
  }

  return (
    <aside className="sticky top-0 z-40 flex w-full shrink-0 flex-col border-b border-ink-700 bg-ink-900 p-3 md:h-screen md:w-64 md:border-b-0 md:border-r md:p-4">
      <div className="flex items-center justify-between px-2 py-2 md:block md:py-3">
        <div><p className="font-display text-base font-bold text-fg md:text-lg">{storeName}</p><p className="text-xs text-fg-subtle">Quản trị</p></div>
        <button type="button" onClick={handleLogout} className="flex h-10 items-center gap-2 rounded-lg px-3 text-xs text-fg-muted hover:bg-white/5 hover:text-fg md:hidden"><LogOut className="h-4 w-4" aria-hidden="true" />Đăng xuất</button>
      </div>

      <nav aria-label="Điều hướng quản trị" className="mt-2 flex gap-1 overflow-x-auto pb-1 md:mt-4 md:flex-1 md:flex-col md:gap-1 md:overflow-visible md:pb-0">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-xs transition-colors sm:text-sm md:gap-3",
                active
                  ? "bg-brand/15 text-brand"
                  : "text-fg-muted hover:bg-white/5 hover:text-fg",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
              {item.href === "/admin/don-hang" && hasPendingOrders && (
                <span
                  className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-red-500"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="hidden items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-fg-muted transition-colors hover:bg-white/5 hover:text-fg md:flex"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Đăng xuất
      </button>
    </aside>
  );
}
