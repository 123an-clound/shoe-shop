"use client";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/** Content is visible in SSR. Only offscreen content on fine pointers gets an entrance. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || !matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches || node.getBoundingClientRect().top < innerHeight) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { node.classList.add("reveal-enter"); observer.disconnect(); }
    }, { rootMargin: "0px 0px -40px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={className} style={{ "--reveal-delay": `${delay}s` } as CSSProperties}>{children}</div>;
}
