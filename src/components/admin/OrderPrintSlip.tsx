import type { Order } from "@/lib/queries/admin";
import type { OrderItem } from "@/types";
import { formatVND } from "@/lib/format";
import { codCollectionAmount, formatOrderDate, paymentLabel } from "@/lib/orderOperations";
import { ORDER_STATUS_LABEL, isOrderStatus } from "@/lib/orderStatus";

export function OrderPrintSlip({ order, items, storeName }: { order: Order; items: OrderItem[]; storeName: string }) {
  const toCollect = codCollectionAmount(order);
  return <section data-order-print className="hidden" aria-label="Phiếu đóng gói">
    <h1 className="text-2xl font-bold">{storeName} · Phiếu đóng gói</h1>
    <p className="mt-2">Mã đơn: <strong>{order.code}</strong> · Đặt lúc {formatOrderDate(order.created_at)}</p>
    <p className="mt-1">Trạng thái: {isOrderStatus(order.status) ? ORDER_STATUS_LABEL[order.status] : order.status}</p>
    {order.status === "cancelled" && <p className="mt-2 font-bold">ĐƠN ĐÃ HỦY — KHÔNG GIAO HÀNG</p>}
    <h2 className="mt-5 text-lg font-bold">Người nhận</h2>
    <p>{order.customer_name} · {order.customer_phone}</p><p>{order.address}</p>
    {order.note && <p className="mt-2 whitespace-pre-wrap">Ghi chú khách: {order.note}</p>}
    <p className="mt-3">Vận chuyển: {order.shipping_carrier || "Chưa bàn giao"} · Mã vận đơn: {order.tracking_number || "Chưa có"}</p>
    <table className="mt-5 w-full text-sm"><caption className="mb-2 text-left text-lg font-bold">Sản phẩm cần đóng gói</caption><thead><tr><th scope="col" className="text-left">Sản phẩm / Màu / Size</th><th scope="col">Số lượng</th><th scope="col" className="text-right">Thành tiền</th></tr></thead>
      <tbody>{items.map((item,index)=><tr key={index}><td className="py-3">{item.name}<br />Màu {item.color} · Size {item.size}</td><td className="text-center">{item.quantity}</td><td className="text-right">{formatVND(item.price*item.quantity)}</td></tr>)}</tbody>
    </table>
    <div className="ml-auto mt-5 max-w-sm space-y-2 text-sm">
      <p className="flex justify-between"><span>Tạm tính</span><span>{formatVND(order.subtotal)}</span></p>
      <p className="flex justify-between"><span>Giảm giá</span><span>-{formatVND(order.discount)}</span></p>
      <p className="flex justify-between"><span>Phí vận chuyển</span><span>{formatVND(order.shipping_fee)}</span></p>
      <p className="flex justify-between font-bold"><span>Tổng đơn</span><span>{formatVND(order.total)}</span></p>
      <p>{paymentLabel(order.payment_status)}</p>
      <p className="flex justify-between text-lg font-bold"><span>Cần thu COD</span><span>{toCollect === null ? "Kiểm tra đối soát" : formatVND(toCollect)}</span></p>
    </div>
    <p className="mt-8 text-xs">Phiếu dùng để kiểm hàng và đóng gói, không phải hóa đơn thuế.</p>
  </section>;
}
