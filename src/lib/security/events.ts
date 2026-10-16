export type SecurityEvent = "auth_failure" | "auth_success" | "access_denied" | "rate_limited" | "dependency_failure" | "application_error" | "monitor_probe";

/** Chỉ log metadata định sẵn. Không nhận payload, URL, email, cookie hoặc message lỗi. */
export function securityEvent(event: SecurityEvent, code?: string) {
  const id = crypto.randomUUID();
  console.warn(JSON.stringify({ timestamp: new Date().toISOString(), service: "shoe-shop", event, id,
    ...(code && /^[A-Z0-9_]{1,32}$/.test(code) ? { code } : {}) }));
  return id;
}
