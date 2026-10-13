"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function OrderError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <div role="alert" className="flex max-w-xl flex-col gap-4 rounded-xl border border-ink-700 bg-ink-900 p-6">
    <h1 className="text-xl font-semibold text-fg">Chưa tải được đơn hàng</h1>
    <p className="text-sm text-fg-muted">Kiểm tra kết nối và thử tải lại. Nếu đang lưu thay đổi, mở lại đơn để xác nhận trạng thái trước khi thao tác tiếp.</p>
    <div className="flex flex-wrap gap-3"><Button type="button" variant="glass" onClick={retry}>Thử tải lại</Button><Link href="/admin/don-hang" className="inline-flex min-h-11 items-center px-3 text-sm text-fg underline focus-visible:outline-2 focus-visible:outline-brand">Danh sách đơn hàng</Link></div>
  </div>;
}
