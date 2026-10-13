export function normalizePhone(value: string): string | null {
  const phone = value.trim().replace(/[\s().-]/g, "");
  if (/^0[35789]\d{8}$/.test(phone)) return `+84${phone.slice(1)}`;
  return /^\+84[35789]\d{8}$/.test(phone) ? phone : null;
}

export function customerCartPath(locale: string): string { return `${locale === "en" ? "/en" : ""}/gio-hang`; }

export type CustomerAuthTarget = "cart" | "checkout";
export function customerAuthTarget(value: unknown): CustomerAuthTarget { return value === "checkout" ? "checkout" : "cart"; }
export function customerReturnPath(locale: string, target: unknown): string {
  return `${locale === "en" ? "/en" : ""}/${customerAuthTarget(target) === "checkout" ? "thanh-toan" : "gio-hang"}`;
}
export function customerReturnHash(target: unknown): string { return customerAuthTarget(target) === "checkout" ? "tai-khoan" : "don-hang"; }
export function checkoutIdentityMatches(expected: string | null, actual: string | null): boolean { return expected === actual; }

export function authOrigin(origin: string | null, environment: { siteUrl?: string; vercelHost?: string; development: boolean }): string | null {
  if (!origin) return null;
  const allowed = [environment.siteUrl, environment.vercelHost ? `https://${environment.vercelHost}` : undefined,
    ...(environment.development ? ["http://localhost:3000", "http://127.0.0.1:3000"] : [])];
  try { const candidate = new URL(origin).origin; return allowed.some((url) => url && new URL(url).origin === candidate) ? candidate : null; } catch { return null; }
}
