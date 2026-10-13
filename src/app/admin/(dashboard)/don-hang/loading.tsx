export default function OrdersLoading() {
  return <div role="status" className="flex flex-col gap-4"><h1 className="text-2xl font-semibold text-fg">Đơn hàng</h1><p className="text-sm text-fg-muted">Đang tải thông tin xử lý đơn...</p><div aria-hidden="true" className="h-36 rounded-xl border border-ink-700 bg-ink-900" /><div aria-hidden="true" className="h-64 rounded-xl border border-ink-700 bg-ink-900" /></div>;
}
