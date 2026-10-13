import "server-only";
import { cache } from "react";
import { isAuthSessionMissingError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Only a verified user can own an order. Service failures must not become guests.
export async function verifyCustomerSession(supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error && !isAuthSessionMissingError(error)) return { user: null, error: true };
    return { user, error: false };
  } catch { return { user: null, error: true }; }
}
// React cache only deduplicates within the server request, never between users.
export const getCustomerSession = cache(async () => verifyCustomerSession(await createClient()));
