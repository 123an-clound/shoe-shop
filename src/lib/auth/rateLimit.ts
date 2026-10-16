import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import "server-only";
import { headers } from "next/headers";
import { privateSubject, requestSource } from "@/lib/security/source";
import { securityEvent } from "@/lib/security/events";

export async function checkAuthRate(supabase: SupabaseClient<Database>, action: "admin-login" | "otp-send" | "otp-verify" | "media-upload", identity: string): Promise<"allowed" | "limited" | "unavailable"> {
  try {
    const key = process.env.VELOCE_SECURITY_KEY;
    const source = requestSource(await headers(), process.env.VERCEL === "1", process.env.NODE_ENV === "production");
    if (!key || !/^[0-9a-f]{64}$/.test(key) || !source) {
      securityEvent("dependency_failure", "AUTH_RATE_CONFIG");
      return "unavailable";
    }
    const { error } = await supabase.rpc("veloce_check_auth_rate_trusted", {
      p_action: action, p_identity: privateSubject(identity.trim().toLowerCase(), key),
      p_source: privateSubject(source, key), p_server_token: key,
    });
    if (error) securityEvent(error.code === "P0001" ? "rate_limited" : "dependency_failure", error.code);
    return error ? error.code === "P0001" ? "limited" : "unavailable" : "allowed";
  } catch { return "unavailable"; }
}
