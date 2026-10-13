"use client";
export const CUSTOMER_AUTH_CHANGED = "veloce:customer-auth-changed";
export function notifyCustomerAuthChanged() { window.dispatchEvent(new Event(CUSTOMER_AUTH_CHANGED)); }
