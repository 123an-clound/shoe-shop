"use client";

import { Input } from "@/components/ui/Input";

export type OrderDraft = { carrier: string; tracking: string; note: string; packed: boolean };

export function OrderMetadataFields({ draft, onChange, status, disabled }: { draft: OrderDraft; onChange: (draft: OrderDraft) => void; status: string; disabled: boolean }) {
  const terminal = status === "done" || status === "cancelled";
  return <fieldset disabled={disabled} className="flex min-w-0 flex-col gap-4">
    <legend className="mb-3 font-semibold text-fg">Vận chuyển & ghi chú nội bộ</legend>
    <div className="grid gap-4 sm:grid-cols-2">
      <Input id="shipping-carrier" label="Hãng vận chuyển" value={draft.carrier} maxLength={100} disabled={terminal}
        className="min-w-0 w-full text-base sm:text-sm" onChange={event => onChange({ ...draft, carrier: event.target.value })} />
      <Input id="tracking-number" label="Mã vận đơn" value={draft.tracking} maxLength={100} disabled={terminal}
        className="min-w-0 w-full text-base sm:text-sm" onChange={event => onChange({ ...draft, tracking: event.target.value })} />
    </div>
    {status === "confirmed" && <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-ink-700 p-3 text-sm text-fg">
      <input type="checkbox" checked={draft.packed} onChange={event => onChange({ ...draft, packed: event.target.checked })} className="h-5 w-5 shrink-0" />
      Đã kiểm đủ sản phẩm, đúng màu/size và đóng gói
    </label>}
    <div className="flex flex-col gap-1.5">
      <label htmlFor="order-internal-note" className="text-sm text-fg-muted">Ghi chú nội bộ (khách hàng không thấy)</label>
      <textarea id="order-internal-note" value={draft.note} maxLength={2000} rows={4} onChange={event => onChange({ ...draft, note: event.target.value })}
        className="min-w-0 w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-3 text-base text-fg focus-visible:outline-2 focus-visible:outline-brand sm:text-sm" />
      <p className="text-xs tabular-nums text-fg-muted">{draft.note.length}/2.000 ký tự</p>
    </div>
  </fieldset>;
}
