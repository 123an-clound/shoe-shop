import "server-only";
import { createClient } from "@/lib/supabase/server";
import { readReceipts } from "./receipts";
import { customerGroupedHistorySchema, customerOrderSchema, orderInScope, type CustomerOrderScope } from "./orders";
import { verifyCustomerSession } from "./session";

export async function getCustomerHistory(page = 1, scope: CustomerOrderScope = "all") {
  const supabase = await createClient();
  const { user, error: sessionError } = await verifyCustomerSession(supabase);
  const receipts = await readReceipts();
  const recent = await Promise.all((user || sessionError ? [] : receipts).map(async (receipt) => {
    const { data, error } = await supabase.rpc("veloce_customer_receipt", { p_order_id: receipt.id, p_token: receipt.token });
    const parsed = customerOrderSchema.safeParse(data);
    return error || !parsed.success ? null : parsed.data;
  }));
  const validRecent = recent.filter((order) => order !== null);
  let orders: ReturnType<typeof customerGroupedHistorySchema.parse> = { orders: [], total: validRecent.filter((order) => orderInScope(order, scope)).length, active_count: validRecent.filter((order) => orderInScope(order, "active")).length, history_count: validRecent.filter((order) => orderInScope(order, "history")).length, page: 1 };
  let error = sessionError;
  if (user) {
    const result = await supabase.rpc("veloce_customer_orders_by_status", { p_page: page, p_scope: scope });
    const parsed = customerGroupedHistorySchema.safeParse(result.data);
    if (result.error || !parsed.success) error = true;
    else orders = parsed.data;
  }
  return { identity: user ? user.phone || user.email || "—" : null, ...orders, error,
    recent: validRecent.filter((order) => orderInScope(order, scope)), hasReceipts: receipts.length > 0,
    hasRecent: validRecent.length > 0, sessionError,
    receiptError: recent.some((order) => order === null),
  };
}
export async function getRecentOrder(code: string | null) {
  if (!code || code.length > 40) return null;
  const receipt = (await readReceipts()).find((item) => item.code === code);
  if (!receipt) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("veloce_customer_receipt", { p_order_id: receipt.id, p_token: receipt.token });
  const parsed = customerOrderSchema.safeParse(data);
  return error || !parsed.success ? null : parsed.data;
}
