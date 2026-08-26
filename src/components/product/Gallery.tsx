"use client";

import Image from "next/image";
import { useState, type MouseEvent } from "react";
import { cn } from "@/lib/cn";
import { usePointerFine } from "@/lib/hooks/useMediaQuery";

export function Gallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const pointerFine = usePointerFine();
  const [zoom, setZoom] = useState({ origin: "center", scale: 1 });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!pointerFine) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ origin: `${x}% ${y}%`, scale: 1.6 });
  }

  function handleMouseLeave() {
    setZoom({ origin: "center", scale: 1 });
  }

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-[var(--radius-card)] bg-ink-800 text-sm text-fg-subtle">
        Chưa có ảnh sản phẩm
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto sm:flex-col sm:overflow-visible">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Xem ảnh ${i + 1}`}
              aria-current={active === i}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:w-20",
                active === i ? "border-brand" : "border-transparent",
              )}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div
        className="relative flex-1 touch-pan-y overflow-hidden rounded-[var(--radius-card)] bg-ink-800"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative aspect-square">
          <Image
            src={images[active]}
            alt={productName}
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover transition-transform duration-300 ease-out"
            style={{ transformOrigin: zoom.origin, transform: `scale(${zoom.scale})` }}
          />
        </div>
      </div>
    </div>
  );
}
