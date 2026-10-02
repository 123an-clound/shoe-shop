import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminInbox } from "@/components/admin/AdminInbox";
import { getContactMessages, getNewsletterSubscribers, type InboxKind } from "@/lib/queries/inbox";

export const metadata: Metadata = { title: "Hộp thư — Quản trị" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminInboxPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const kind: InboxKind = params.type === "newsletter" ? "newsletter" : "contact";
  const search = typeof params.search === "string" ? params.search.trim().slice(0, 80) : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const parsedPage = Number(typeof params.page === "string" ? params.page : "1");
  const page = Number.isInteger(parsedPage) ? Math.max(1, parsedPage) : 1;
  const result = kind === "contact"
    ? await getContactMessages(page, search, status)
    : await getNewsletterSubscribers(page, search, status);
  const pages = Math.max(1, Math.ceil(result.count / result.pageSize));
  if (page > pages) {
    const query = new URLSearchParams({ type: kind, page: String(pages), search, status });
    redirect(`/admin/hop-thu?${query.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-fg">Hộp thư</h1>
        <p className="mt-1 text-sm text-fg-muted">Tin nhắn và email được lưu từ các biểu mẫu trên website.</p>
      </header>

      <nav aria-label="Loại hộp thư" className="flex gap-2 border-b border-ink-700">
        <Link aria-current={kind === "contact" ? "page" : undefined} href="/admin/hop-thu?type=contact" className={`border-b-2 px-3 py-3 text-sm ${kind === "contact" ? "border-brand font-semibold text-fg" : "border-transparent text-fg-muted hover:text-fg"}`}>
          Tin nhắn liên hệ
        </Link>
        <Link aria-current={kind === "newsletter" ? "page" : undefined} href="/admin/hop-thu?type=newsletter" className={`border-b-2 px-3 py-3 text-sm ${kind === "newsletter" ? "border-brand font-semibold text-fg" : "border-transparent text-fg-muted hover:text-fg"}`}>
          Đăng ký nhận tin
        </Link>
      </nav>

      <AdminInbox kind={kind} items={result.items} count={result.count} page={page} pageSize={result.pageSize} search={search} status={status} />
    </div>
  );
}
