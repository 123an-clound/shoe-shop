/** Auth chỉ chạy tại server; browser dùng client anon không đọc/refresh cookie. */
export function authCookieOptions(production = process.env.NODE_ENV === "production") {
  return { httpOnly: true, secure: production, sameSite: "lax" as const, path: "/", maxAge: 7 * 24 * 60 * 60 };
}

export function hardenAuthCookie(options: { maxAge?: number; [key: string]: unknown }, production = process.env.NODE_ENV === "production") {
  const defaults = authCookieOptions(production);
  return { ...options, ...defaults, maxAge: Math.min(options.maxAge ?? defaults.maxAge, defaults.maxAge) };
}
