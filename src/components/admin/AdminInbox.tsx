"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateContactMessageStatus, updateNewsletterStatus } from "@/lib/actions/inbox";
import type { ContactMessage, InboxKind, NewsletterSubscriber } from "@/lib/queries/inbox";

type Props = {
  kind: InboxKind;
  items: ContactMessage[] | NewsletterSubscriber[];
  count: number;
  page: number;
  pageSize: number;
  search: string;
  status: string;
};

function pageHref(props: Props, page: number) {
  const params = new URLSearchParams({
    type: props.kind,
    page: String(page),
    search: props.search,
    status: props.status,
  });
  return `/admin/hop-thu?${params.toString()}`;
}

export function AdminInbox(props: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const pages = Math.max(1, Math.ceil(props.count / props.pageSize));

  async function changeStatus(item: ContactMessage | NewsletterSubscriber, nextStatus: string) {
    if (busyId) return;
    setBusyId(item.id);
    try {
      const result = props.kind === "contact"
        ? await updateContactMessageStatus(item.id, item.updated_at, nextStatus as "new" | "read" | "archived")
        : await updateNewsletterStatus(item.id, item.updated_at, nextStatus as "active" | "unsubscribed");
      if (!result.success) {
        toast.error(result.error);
        router.refresh();
        return;
      }
      toast.success("Đã cập nhật hộp thư");
      router.refresh();
    } catch {
      toast.error("Không kết nối được. Trạng thái chưa được xác nhận.");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-xl border border-ink-700 bg-ink-900 p-4 sm:flex-row sm:items-end">
        <form method="get" className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_auto]">
          <input type="hidden" name="type" value={props.kind} />
          <label className="flex flex-col gap-1.5 text-xs text-fg-muted">
            Tìm theo {props.kind === "contact" ? "tên, email hoặc nội dung" : "email"}
            <input
              name="search"
              defaultValue={props.search}
              maxLength={80}
              className="h-11 rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm text-fg focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-fg-muted">
            Trạng thái
            <select
              name="status"
              defaultValue={props.status}
              className="h-11 rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm text-fg focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              <option value="all">Tất cả</option>
              {props.kind === "contact" ? (
                <>
                  <option value="new">Mới</option><option value="read">Đã xem</option><option value="archived">Đã lưu trữ</option>
                </>
              ) : (
                <>
                  <option value="active">Đang đăng ký</option><option value="unsubscribed">Đã hủy</option>
                </>
              )}
            </select>
          </label>
          <button type="submit" className="h-11 self-end rounded-lg bg-brand px-5 text-sm font-semibold text-on-brand hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">
            Lọc
          </button>
        </form>
        <p className="text-sm text-fg-muted">{props.count.toLocaleString("vi-VN")} kết quả</p>
      </div>

      {props.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-700 px-6 py-12 text-center text-sm text-fg-muted">
          {props.search || props.status !== "all" ? "Không có mục nào khớp bộ lọc." : "Hộp thư đang trống."}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {props.kind === "contact"
            ? (props.items as ContactMessage[]).map((item) => (
                <li key={item.id}>
                  <article className="grid gap-4 rounded-xl border border-ink-700 bg-ink-900 p-4 md:grid-cols-[minmax(0,1fr)_180px] md:p-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h2 className="font-semibold text-fg">{item.name}</h2>
                        <a href={`mailto:${item.email}`} className="break-all text-sm text-brand hover:underline">{item.email}</a>
                        <time className="text-xs text-fg-subtle" dateTime={item.created_at}>{new Date(item.created_at).toLocaleString("vi-VN")}</time>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-fg-muted">{item.message}</p>
                    </div>
                    <label className="flex flex-col gap-1.5 text-xs text-fg-muted">
                      Trạng thái tin nhắn
                      <select
                        value={item.status}
                        aria-label={`Trạng thái tin nhắn từ ${item.name}`}
                        disabled={busyId !== null}
                        onChange={(event) => void changeStatus(item, event.target.value)}
                        className="h-11 rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm text-fg focus:border-brand focus:outline-none disabled:opacity-60"
                      >
                        <option value="new">Mới</option><option value="read">Đã xem</option><option value="archived">Đã lưu trữ</option>
                      </select>
                    </label>
                  </article>
                </li>
              ))
            : (props.items as NewsletterSubscriber[]).map((item) => (
                <li key={item.id}>
                  <article className="grid gap-4 rounded-xl border border-ink-700 bg-ink-900 p-4 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center sm:p-5">
                    <div className="min-w-0">
                      <a href={`mailto:${item.email}`} className="break-all font-semibold text-brand hover:underline">{item.email}</a>
                      <p className="mt-1 text-xs text-fg-subtle">Đăng ký: {new Date(item.created_at).toLocaleString("vi-VN")} · Ngôn ngữ: {item.locale.toUpperCase()}</p>
                    </div>
                    <label className="flex flex-col gap-1.5 text-xs text-fg-muted">
                      Trạng thái đăng ký
                      <select
                        value={item.status}
                        aria-label={`Trạng thái đăng ký ${item.email}`}
                        disabled={busyId !== null}
                        onChange={(event) => void changeStatus(item, event.target.value)}
                        className="h-11 rounded-lg border border-ink-700 bg-ink-950 px-3 text-sm text-fg focus:border-brand focus:outline-none disabled:opacity-60"
                      >
                        <option value="active">Đang đăng ký</option><option value="unsubscribed">Đã hủy</option>
                      </select>
                    </label>
                  </article>
                </li>
              ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Phân trang hộp thư" className="flex items-center justify-between gap-3">
          <a aria-disabled={props.page <= 1} className={`rounded-lg border border-ink-700 px-4 py-2 text-sm ${props.page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-white/5"}`} href={pageHref(props, Math.max(1, props.page - 1))}>Trang trước</a>
          <span className="text-sm text-fg-muted">Trang {props.page} / {pages}</span>
          <a aria-disabled={props.page >= pages} className={`rounded-lg border border-ink-700 px-4 py-2 text-sm ${props.page >= pages ? "pointer-events-none opacity-40" : "hover:bg-white/5"}`} href={pageHref(props, Math.min(pages, props.page + 1))}>Trang sau</a>
        </nav>
      )}
    </div>
  );
}
