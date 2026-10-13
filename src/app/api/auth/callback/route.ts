import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claimReceipts } from "@/lib/customer/receipts";
import { customerReturnPath, customerReturnHash } from "@/lib/customer/identity";

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") === "en" ? "en" : "vi";
  const target = request.nextUrl.searchParams.get("target");
  const destination = new URL(customerReturnPath(locale, target), request.url);
  destination.hash = customerReturnHash(target);
  const code = request.nextUrl.searchParams.get("code");
  try {
    if (!code || code.length > 2048) throw new Error("Missing authorization code");
    const supabase = await createClient();
    const flowId = request.nextUrl.searchParams.get("sb_flow_id");
    const { data, error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
    if (error || !data.user) throw new Error("Session exchange failed");
    if (!(await claimReceipts().catch(() => false))) destination.searchParams.set("auth", "claim-failed");
  } catch { destination.searchParams.set("auth", "error"); }
  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
