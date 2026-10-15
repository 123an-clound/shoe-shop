"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageTransition() {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const previous = useRef(pathname);
  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    if (matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    const animation = ref.current?.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], { duration: 180, easing: "cubic-bezier(.22,1,.36,1)" });
    return () => animation?.cancel();
  }, [pathname]);
  return <div ref={ref} aria-hidden="true" style={{ transformOrigin: "right", transform: "scaleX(0)" }} className="pointer-events-none fixed inset-0 z-[100] bg-[image:var(--gradient-aurora)]" />;
}
