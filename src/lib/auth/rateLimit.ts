import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function checkAuthRate(supabase: SupabaseClient<Database>, action: "admin-login" | "otp-send" | "otp-verify", identity: string): Promise<"allowed" | "limited" | "unavailable"> {
  try {
    const { error } = await supabase.rpc("veloce_check_auth_rate", { p_action: action, p_identity: identity.trim().toLowerCase() });
    return error ? error.code === "P0001" ? "limited" : "unavailable" : "allowed";
  } catch { return "unavailable"; }
}
