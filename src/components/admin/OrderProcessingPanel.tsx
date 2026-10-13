"use client";

import { useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { OrderMetadataFields, type OrderDraft } from "@/components/admin/OrderMetadataFields";
import { OrderCancellationForm } from "@/components/admin/OrderCancellationForm";
import { cancelOrder, updateOrderOperations } from "@/lib/actions/adminOrders";
import { orderPatchSchema, paymentLabel, formatOrderDate, type OrderPatch } from "@/lib/orderOperations";
import { formatVND } from "@/lib/format";
import type { ActionResult } from "@/lib/actions/products";
import type { Order } from "@/lib/queries/admin";

export function OrderProcessingPanel({ order }: { order: Order }) {
  const router = useRouter();
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<OrderDraft>({ carrier: order.shipping_carrier ?? "", tracking: order.tracking_number ?? "", note: order.internal_note ?? "", packed: !!order.packed_at });
  const terminal = order.status === "done" || order.status === "cancelled";
  const dirty = draft.note.trim() !== (order.internal_note ?? "") || (!terminal && (draft.carrier.trim() !== (order.shipping_carrier ?? "") || draft.tracking.trim() !== (order.tracking_number ?? "") || draft.packed !== !!order.packed_at));
  const next = order.status === "pending" ? { status: "confirmed" as const, label: "Xác nhận đơn" } : order.status === "confirmed" ? { status: "shipping" as const, label: "Bàn giao vận chuyển" } : order.status === "shipping" ? { status: "done" as const, label: "Xác nhận giao thành công" } : null;
  const readyToShip = !!order.packed_at && !!order.shipping_carrier?.trim() && !!order.tracking_number?.trim();

  async function run(operation: () => Promise<ActionResult>, message: string) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true); setError("");
    try {
      const result = await operation();
      if (!result.success) { setError(result.error); return; }
      toast.success(message);
      router.refresh();
    } catch { setError("Không kết nối được. Dữ liệu đang nhập vẫn được giữ lại. Làm mới trang để kiểm tra trước khi thử lại."); }
    finally { inFlight.current = false; setBusy(false); }
  }

  async function patch(input: OrderPatch, message: string) {
    const parsed = orderPatchSchema.safeParse(input);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Kiểm tra thông tin cập nhật."); return; }
    await run(() => updateOrderOperations(order.id, order.updated_at, parsed.data), message);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty || busy) return;
    const input: OrderPatch = { internal_note: draft.note };
    if (!terminal) {
      input.shipping_carrier = draft.carrier;
      input.tracking_number = draft.tracking;
      if (order.status === "confirmed") input.packed = draft.packed;
    }
    await patch(input, "Đã lưu vận chuyển và ghi chú");
  }

  async function recordPayment(payment: "paid" | "refunded") {
    if (busy || dirty) return;
    const label = payment === "paid" ? "đã thực nhận" : "đã hoàn lại cho khách";
    if (!window.confirm(`Xác nhận shop ${label} ${formatVND(order.total)} của đơn ${order.code}? Thao tác này ghi sổ đối soát và không chuyển tiền tự động.`)) return;
    await patch({ payment_status: payment }, payment === "paid" ? "Đã ghi nhận thu tiền" : "Đã ghi nhận hoàn tiền");
  }

  return <section id="order-processing" tabIndex={-1} aria-label="Thao tác xử lý đơn" className="flex min-w-0 scroll-mt-60 flex-col gap-4 focus-visible:outline-2 focus-visible:outline-brand md:scroll-mt-4" aria-busy={busy}>
    <div className="rounded-xl border border-ink-700 bg-ink-900 p-5">
      <h2 className="font-semibold text-fg">Bước xử lý tiếp theo</h2>
      {next ? <div className="mt-3 flex flex-col items-start gap-3">
        {order.status === "confirmed" && !readyToShip && <p className="text-sm text-fg-muted">Nhập hãng vận chuyển, mã vận đơn và đánh dấu đã đóng gói; lưu thông tin trước khi bàn giao.</p>}
        <Button type="button" disabled={busy || dirty || (order.status === "confirmed" && !readyToShip)} onClick={() => {
          if (next.status === "done" && !window.confirm(`Xác nhận khách đã nhận đơn ${order.code}? Trạng thái thu tiền được đối soát riêng.`)) return;
          void patch({ status: next.status }, "Đã cập nhật trạng thái đơn");
        }}>{busy ? "Đang xử lý..." : next.label}</Button>
      </div> : <p className="mt-3 text-sm text-fg-muted">{order.status === "done" ? "Đơn đã giao thành công. Kiểm tra thu tiền và lưu các ghi chú cần thiết." : "Đơn đã hủy. Kiểm tra hoàn tiền nếu trước đó đã thu tiền."}</p>}
      {dirty && <p role="status" className="mt-3 text-sm text-amber-400">Có thông tin chưa lưu. Lưu vận chuyển và ghi chú trước khi đổi trạng thái, đối soát hoặc hủy đơn.</p>}
      {error && <div className="mt-3"><p role="alert" className="text-sm text-red-400">{error}</p><Button type="button" variant="ghost" className="mt-2" disabled={busy} onClick={() => window.location.reload()}>Tải lại đơn để kiểm tra</Button></div>}
    </div>
    <form onSubmit={save} className="rounded-xl border border-ink-700 bg-ink-900 p-5">
      <OrderMetadataFields draft={draft} status={order.status} disabled={busy} onChange={setDraft} />
      {order.packed_at && <p className="mt-3 text-xs text-fg-muted">Đóng gói lúc {formatOrderDate(order.packed_at)}</p>}
      <Button type="submit" variant="glass" disabled={busy || !dirty} className="mt-4">{busy ? "Đang lưu..." : "Lưu vận chuyển & ghi chú"}</Button>
    </form>
    <div className="rounded-xl border border-ink-700 bg-ink-900 p-5">
      <h2 className="font-semibold text-fg">Đối soát thanh toán COD</h2>
      <p className="mt-3 text-sm text-fg">{paymentLabel(order.payment_status)} · <span className="font-semibold tabular-nums">{formatVND(order.total)}</span></p>
      <p className="mt-2 text-sm text-fg-muted">Ghi nhận sau khi shop thực nhận hoặc đã hoàn tiền. Trạng thái này không thực hiện giao dịch thanh toán.</p>
      {order.paid_at && <p className="mt-2 text-xs text-fg-muted">Ghi nhận thu tiền: {formatOrderDate(order.paid_at)}</p>}
      {order.refunded_at && <p className="mt-2 text-xs text-fg-muted">Ghi nhận hoàn tiền: {formatOrderDate(order.refunded_at)}</p>}
      {(order.payment_status === null || order.payment_status === "unpaid") && <Button type="button" variant="glass" className="mt-4" disabled={busy || dirty} onClick={() => recordPayment("paid")}>Ghi nhận đã thu tiền</Button>}
      {order.payment_status === "paid" && order.status === "cancelled" && <Button type="button" variant="glass" className="mt-4" disabled={busy || dirty} onClick={() => recordPayment("refunded")}>Ghi nhận đã hoàn tiền</Button>}
    </div>
    <OrderCancellationForm order={order} disabled={busy || dirty} onCancel={async (reason, returned) => {
      await run(() => cancelOrder(order.id, order.updated_at, reason, returned), "Đã hủy đơn và hoàn kho");
    }} />
  </section>;
}
