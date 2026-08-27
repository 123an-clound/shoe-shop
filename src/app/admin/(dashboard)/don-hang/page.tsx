import type { Metadata } from "next";
import { getAdminOrders } from "@/lib/queries/admin";
import { OrdersTable } from "@/components/admin/OrdersTable";

export const metadata: Metadata = { title: "Đơn hàng — Quản trị" };

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-fg">Đơn hàng</h1>
      <OrdersTable orders={orders} />
    </div>
  );
}
