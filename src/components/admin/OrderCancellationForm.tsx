"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Order } from "@/lib/queries/admin";

export function OrderCancellationForm({ order, disabled, onCancel }: { order: Order; disabled: boolean; onCancel: (reason: string, returned: boolean) => Promise<void> }) {
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const [returned, setReturned] = useState(false);
  if (order.status === "done" || order.status === "cancelled") return null;
  const shipping = order.status === "shipping";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || code.trim() !== order.code || reason.trim().length < 3 || (shipping && !returned)) return;
    await onCancel(reason, returned);
  }
  return <details className="rounded-xl border border-red-400/30 bg-ink-900 p-4">
    <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium text-red-400 focus-visible:outline-2 focus-visible:outline-brand">Hủy đơn và hoàn kho</summary>
    <form onSubmit={submit} className="mt-3 flex flex-col gap-4">
      <p className="text-sm text-fg-muted">Hủy đơn sẽ hoàn lại số lượng đúng màu và size. Ghi lại lý do để nhân viên khác theo dõi.</p>
      {order.payment_status === "paid" && <p className="text-sm text-amber-400">Đơn đã thu tiền. Sau khi hủy, hoàn tiền cho khách và ghi nhận đã hoàn tiền tại phần đối soát.</p>}
      <fieldset disabled={disabled} className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-1.5"><label htmlFor="order-cancel-reason" className="text-sm text-fg-muted">Lý do hủy</label>
          <textarea id="order-cancel-reason" required minLength={3} maxLength={500} rows={3} value={reason} onChange={event => setReason(event.target.value)} className="w-full rounded-lg border border-ink-700 bg-ink-900 p-3 text-base text-fg focus-visible:outline-2 focus-visible:outline-brand sm:text-sm" /></div>
        <Input id="order-cancel-code" label={`Nhập lại mã ${order.code} để xác nhận`} value={code} onChange={event => setCode(event.target.value)} autoComplete="off" className="min-w-0 w-full text-base sm:text-sm" />
        {shipping && <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm text-fg"><input type="checkbox" checked={returned} onChange={event => setReturned(event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0" />Đã nhận hàng về kho và kiểm đủ sản phẩm trước khi hoàn tồn kho</label>}
        <Button type="submit" variant="glass" disabled={disabled || reason.trim().length < 3 || code.trim() !== order.code || (shipping && !returned)} className="self-start border border-red-400/40 text-red-400">Xác nhận hủy đơn</Button>
      </fieldset>
    </form>
  </details>;
}
