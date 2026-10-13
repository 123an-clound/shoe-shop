import type { Tables } from "@/types/database";
import { formatOrderDate } from "@/lib/orderOperations";
import { orderChangeLines } from "@/lib/orderHistory";

export function OrderTimeline({ events, createdAt }: { events: Tables<"veloce_order_events">[]; createdAt: string }) {
  return <section aria-label="Lịch sử thao tác đơn hàng" className="rounded-xl border border-ink-700 bg-ink-900 p-5">
    <h2 className="font-semibold text-fg">Lịch sử xử lý</h2>
    <p className="mt-2 text-xs text-fg-muted">{events.length === 100 ? "100 thao tác gần nhất. " : ""}Ghi lại người thao tác và thời gian. Đơn cũ chỉ có lịch sử từ khi tính năng được bật.</p>
    <ol className="mt-4 flex flex-col gap-4">
      {events.map(event => <li key={event.id} className="border-l-2 border-ink-700 pl-4">
        <p className="text-xs text-fg-muted"><time dateTime={event.created_at}>{formatOrderDate(event.created_at)}</time> · {event.actor_name}</p>
        {event.event_type === "created" ? <p className="mt-1 text-sm text-fg">Tiếp nhận đơn từ khách hàng</p> : <ul className="mt-1 flex flex-col gap-1 text-sm text-fg">{orderChangeLines(event.changes).map((line,index)=><li key={index} className="break-words">{line}</li>)}</ul>}
      </li>)}
      {!events.some(event => event.event_type === "created") && <li className="border-l-2 border-ink-700 pl-4"><p className="text-xs text-fg-muted"><time dateTime={createdAt}>{formatOrderDate(createdAt)}</time></p><p className="mt-1 text-sm text-fg">Đơn được đặt trên website</p></li>}
    </ol>
  </section>;
}
