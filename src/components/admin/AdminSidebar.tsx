"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { signOutAdmin } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Bảng điều khiển", icon: LayoutDashboard },
  { href: "/admin/san-pham", label: "Sản phẩm", icon: Package },
  { href: "/admin/danh-muc", label: "Danh mục", icon: Tag },
  { href: "/admin/don-hang", label: "Đơn hàng", icon: ShoppingCart },
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
    await signOutAdmin();
    router.push("/admin/dang-nhap");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-ink-700 bg-ink-900 p-4">
      <div className="px-2 py-3">
        <p className="font-display text-lg font-bold text-fg">{storeName}</p>
        <p className="text-xs text-fg-subtle">Quản trị</p>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-brand/15 text-brand"
                  : "text-fg-muted hover:bg-white/5 hover:text-fg",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
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
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-fg-muted transition-colors hover:bg-white/5 hover:text-fg"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Đăng xuất
      </button>
    </aside>
  );
}
