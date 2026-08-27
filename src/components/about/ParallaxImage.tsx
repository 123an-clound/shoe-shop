"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";

/** Ảnh trôi chậm hơn nội dung khi cuộn — mục 5.6 PLAN.md. */
export function ParallaxImage({ src, alt }: { src: string | null; alt: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || !wrapperRef.current || !imageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { yPercent: -12 },
        {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        },
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div
      ref={wrapperRef}
      className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-card)] bg-ink-800"
    >
      <div ref={imageRef} className="absolute inset-0 -top-[12%] h-[124%] w-full">
        {src ? (
          <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-fg-subtle">
            Chưa có ảnh
          </div>
        )}
      </div>
    </div>
  );
}
