import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer/session";

export async function GET() {
  const session = await getCustomerSession();
  const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };
  if (session.error) return NextResponse.json({ error: "Session unavailable" }, { status: 503, headers });
  return NextResponse.json({ signedIn: !!session.user, identity: session.user ? session.user.phone || session.user.email || "—" : null }, { headers });
}
