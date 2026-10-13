import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { addReceipt, parseReceipts, type OrderReceipt } from "./orders";

const COOKIE = "veloce-order-receipts";
export async function readReceipts() { return parseReceipts((await cookies()).get(COOKIE)?.value); }
export async function saveReceipt(receipt: OrderReceipt) {
  const store = await cookies();
  store.set(COOKIE, JSON.stringify(addReceipt(parseReceipts(store.get(COOKIE)?.value), receipt)), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 7 * 24 * 60 * 60,
  });
}
export async function clearReceipts() { (await cookies()).delete(COOKIE); }
export async function claimReceipts(): Promise<boolean> {
  const receipts = await readReceipts();
  if (!receipts.length) return true;
  const supabase = await createClient();
  let success = true;
  for (const receipt of receipts) {
    const { data, error } = await supabase.rpc("veloce_claim_customer_order", { p_order_id: receipt.id, p_token: receipt.token });
    if (error || !data) success = false;
  }
  return success;
}
