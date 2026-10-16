import { createHmac } from "node:crypto";
import { isIP } from "node:net";

export function requestSource(headers: Pick<Headers, "get">, vercel: boolean, production: boolean): string | null {
  // Vercel ghi đè header này; không tin header do client gửi ở hosting khác.
  if (!vercel) return production ? null : "local-development";
  const ip = headers.get("x-vercel-forwarded-for")?.trim();
  return ip && isIP(ip) ? ip : null;
}

export function privateSubject(value: string, key: string): string {
  return createHmac("sha256", key).update(value).digest("hex");
}
