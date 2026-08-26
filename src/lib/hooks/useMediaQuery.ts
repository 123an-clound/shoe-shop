"use client";

import { useSyncExternalStore } from "react";

/** Hook chung cho mọi media query — SSR trả về `false` để tránh lệch hydrate. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Hiệu ứng nặng (cursor, spotlight, tilt, magnetic) chỉ bật trên thiết bị có con trỏ chính xác. */
export function usePointerFine(): boolean {
  return useMediaQuery("(pointer: fine)");
}
