"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeEmail, isOtpCode, customerCartPath, customerReturnPath, customerAuthTarget, authOrigin, type CustomerAuthTarget } from "@/lib/customer/identity";
import { customerCopy } from "@/lib/customer/copy";
import { getCustomerProviders } from "@/lib/customer/providers";
import { claimReceipts, clearReceipts } from "@/lib/customer/receipts";
import type { Locale } from "@/lib/i18n/messages";
import { checkAuthRate } from "@/lib/auth/rateLimit";

type Result = { success: true; url?: string; claimFailed?: boolean } | { success: false; error: string };
function localeOf(value: unknown): Locale { return value === "en" ? "en" : "vi"; }
function revalidateAccount(locale: Locale) {
  revalidatePath(customerCartPath(locale));
  revalidatePath(customerReturnPath(locale, "checkout"));
}
function errorText(code: string | undefined, locale: Locale) {
  const copy = customerCopy(locale);
  if (code === "otp_expired") return copy.expired;
  if (code?.includes("rate_limit")) return copy.rateLimit;
  if (["email_provider_disabled", "provider_disabled", "signup_disabled"].includes(code || "")) return copy.providerUnavailable;
  return copy.authError;
}
export async function sendCustomerOtp(emailInput: string, language: Locale): Promise<Result> {
  const locale = localeOf(language), copy = customerCopy(locale);
  const email = typeof emailInput === "string" ? normalizeEmail(emailInput) : null;
  if (!email) return { success: false, error: copy.invalidEmail };
  try {
    if (!(await getCustomerProviders()).email) return { success: false, error: copy.providerUnavailable };
    const supabase = await createClient();
    const rate = await checkAuthRate(supabase, "otp-send", email);
    if (rate !== "allowed") return { success: false, error: rate === "limited" ? copy.rateLimit : copy.authError };
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    return error ? { success: false, error: errorText(error.code, locale) } : { success: true };
  } catch { return { success: false, error: copy.authError }; }
}
export async function verifyCustomerOtp(emailInput: string, token: string, language: Locale): Promise<Result> {
  const locale = localeOf(language), copy = customerCopy(locale);
  const email = typeof emailInput === "string" ? normalizeEmail(emailInput) : null;
  if (!email) return { success: false, error: copy.invalidEmail };
  if (typeof token !== "string" || !isOtpCode(token)) return { success: false, error: copy.invalidOtp };
  try {
    const supabase = await createClient();
    const rate = await checkAuthRate(supabase, "otp-verify", email);
    if (rate !== "allowed") return { success: false, error: rate === "limited" ? copy.rateLimit : copy.authError };
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    if (error || !data.user) return { success: false, error: errorText(error?.code, locale) };
    const claimed = await claimReceipts().catch(() => false);
    revalidateAccount(locale);
    return { success: true, claimFailed: !claimed };
  } catch { return { success: false, error: copy.authError }; }
}
export async function signInCustomerGoogle(language: Locale, target: CustomerAuthTarget = "cart"): Promise<Result> {
  const locale = localeOf(language), copy = customerCopy(locale);
  try {
    if (!(await getCustomerProviders()).google) return { success: false, error: copy.providerUnavailable };
    const origin = authOrigin((await headers()).get("origin"), {
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined), vercelHost: process.env.VERCEL_URL,
      development: process.env.NODE_ENV !== "production",
    });
    if (!origin) return { success: false, error: copy.authError };
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${origin}/api/auth/callback?locale=${locale}&target=${customerAuthTarget(target)}`, skipBrowserRedirect: true } });
    if (error || !data.url) return { success: false, error: errorText(error?.code, locale) };
    return { success: true, url: data.url };
  } catch { return { success: false, error: copy.authError }; }
}
export async function signOutCustomer(language: Locale): Promise<Result> {
  const locale = localeOf(language);
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) return { success: false, error: customerCopy(locale).authError };
    await clearReceipts();
    revalidateAccount(locale);
    return { success: true };
  } catch { return { success: false, error: customerCopy(locale).authError }; }
}
export async function saveCustomerReceipts(language: Locale): Promise<Result> {
  const locale = localeOf(language);
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: customerCopy(locale).authError };
    const success = await claimReceipts();
    revalidateAccount(locale);
    return success ? { success: true } : { success: false, error: customerCopy(locale).claimError };
  } catch { return { success: false, error: customerCopy(locale).claimError }; }
}
