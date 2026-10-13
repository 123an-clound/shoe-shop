import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Package, Receipt, Wallet } from "lucide-react";
import {
  getLatestOrder,
  getLowStockProducts,
  getRecentOrders,
  getRevenueLast30Days,
  getTotalProductCount,
} from "@/lib/queries/admin";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/Badge";
import { formatTimeAgo, formatVND } from "@/lib/format";
import { ORDER_STATUS_LABEL, isOrderStatus } from "@/lib/orderStatus";
import { getOrderSummary } from "@/lib/queries/adminOrderOperations";
import { OrderWorkload } from "@/components/admin/OrderWorkload";

export const metadata: Metadata = { title: "Bảng điều khiển" };

export default async function AdminDashboardPage() {
  const [summary, latestOrder, recentOrders, revenue, totalProducts, lowStock] =
    await Promise.all([
      getOrderSummary(),
      getLatestOrder(),
      getRecentOrders(5),
      getRevenueLast30Days(),
      getTotalProductCount(),
      getLowStockProducts(),
    ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-bold text-fg">Bảng điều khiển</h1>

      <OrderWorkload summary={summary} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Đơn đặt hôm nay"
          value={String(summary.today)}
          emphasize
          icon={<Receipt className="h-5 w-5 text-brand" aria-hidden="true" />}
          hint={latestOrder ? `Đơn mới nhất: ${formatTimeAgo(latestOrder.created_at)}` : undefined}
        />
        <StatCard
          label="Tổng sản phẩm"
          value={String(totalProducts)}
          icon={<Package className="h-5 w-5 text-brand" aria-hidden="true" />}
        />
        <StatCard
          label="Giá trị đơn hoàn tất · đặt trong 30 ngày"
          value={formatVND(revenue)}
          icon={<Wallet className="h-5 w-5 text-brand" aria-hidden="true" />}
          hint="Giá trị đơn hàng, chưa phải số tiền đã đối soát"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-ink-700 bg-ink-900 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-fg">Đơn mới nhất</h2>
            <Link href="/admin/don-hang" className="text-sm text-brand hover:underline">
              Xem tất cả
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-fg-muted">Chưa có đơn hàng nào.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div>
                    <Link href={`/admin/don-hang/${order.id}`} className="inline-flex min-h-11 items-center font-medium text-fg underline focus-visible:outline-2 focus-visible:outline-brand">{order.code}</Link>
                    <p className="text-xs text-fg-subtle">
                      {order.customer_name} · {formatTimeAgo(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums text-fg-muted">
                      {formatVND(order.total)}
                    </span>
                    <Badge tone={order.status === "pending" ? "brand" : "muted"}>
                      {isOrderStatus(order.status)
                        ? ORDER_STATUS_LABEL[order.status]
                        : order.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[var(--radius-card)] border border-ink-700 bg-ink-900 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-brand-2" aria-hidden="true" />
            <h2 className="font-medium text-fg">Sắp hết hàng</h2>
          </div>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-fg-muted">Không có sản phẩm nào sắp hết hàng.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {lowStock.map((product) => (
                <li key={product.id} className="flex items-center justify-between text-sm">
                  <Link
                    href={`/admin/san-pham/${product.id}`}
                    className="text-fg hover:text-brand"
                  >
                    {product.name}
                  </Link>
                  <span className="tabular-nums text-brand-2">Còn {product.stock}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
