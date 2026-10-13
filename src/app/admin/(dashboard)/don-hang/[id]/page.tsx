import { notFound } from "next/navigation";
import { z } from "zod";
import { getAdminOrderById } from "@/lib/queries/admin";
import { getOrderEvents } from "@/lib/queries/adminOrderOperations";
import { getSettings } from "@/lib/queries/settings";
import { OrderDetailView } from "@/components/admin/OrderDetailView";

export const metadata = { title: "Xử lý đơn hàng — Quản trị" };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const [order, events, settings] = await Promise.all([getAdminOrderById(id), getOrderEvents(id), getSettings()]);
  if (!order) notFound();
  return <OrderDetailView order={order} events={events} storeName={settings.store_name} />;
}
