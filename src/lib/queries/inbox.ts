import { requireAdmin } from "@/lib/auth/requireAdmin";
import type { Tables } from "@/types/database";

export type ContactMessage = Tables<"veloce_contact_messages">;
export type NewsletterSubscriber = Tables<"veloce_newsletter_subscribers">;
export type InboxKind = "contact" | "newsletter";

const PAGE_SIZE = 25;

function cleanSearch(value: string) {
  return value.replace(/[^\p{L}\p{N}@._+\- ]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export async function getContactMessages(page: number, search: string, status: string) {
  const { supabase } = await requireAdmin();
  const from = (page - 1) * PAGE_SIZE;
  let query = supabase
    .from("veloce_contact_messages")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  const term = cleanSearch(search);
  if (term) query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,message.ilike.%${term}%`);
  if (status === "new" || status === "read" || status === "archived") query = query.eq("status", status);
  const { data, count, error } = await query;
  if (error) throw new Error("Không tải được tin nhắn trong hộp thư.");
  return { items: data, count: count ?? 0, pageSize: PAGE_SIZE };
}

export async function getNewsletterSubscribers(page: number, search: string, status: string) {
  const { supabase } = await requireAdmin();
  const from = (page - 1) * PAGE_SIZE;
  let query = supabase
    .from("veloce_newsletter_subscribers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  const term = cleanSearch(search);
  if (term) query = query.ilike("email", `%${term}%`);
  if (status === "active" || status === "unsubscribed") query = query.eq("status", status);
  const { data, count, error } = await query;
  if (error) throw new Error("Không tải được danh sách đăng ký nhận tin.");
  return { items: data, count: count ?? 0, pageSize: PAGE_SIZE };
}
