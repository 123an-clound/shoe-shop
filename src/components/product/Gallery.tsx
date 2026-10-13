"use client";

import Image from "next/image";
import { useState, type MouseEvent } from "react";
import { Video } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePointerFine, usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";
import { useLocaleContext } from "@/components/i18n/LocaleProvider";
import { useProductSelection } from "@/components/product/ProductSelectionProvider";
import { getProductColors } from "@/lib/productVariants";

export function Gallery({
  images,
  productName,
  videoUrl,
  colors,
}: {
  images: string[];
  productName: string;
  videoUrl?: string | null;
  colors?: unknown;
}) {
  const { activeMedia: active, selectMedia: setActive, selectedColor } = useProductSelection();
  const pointerFine = usePointerFine();
  const reducedMotion = usePrefersReducedMotion();
  const { messages } = useLocaleContext();
  const [zoom, setZoom] = useState({ origin: "center", scale: 1 });
  const mediaCount = images.length + (videoUrl ? 1 : 0);
  const selected = active < mediaCount ? active : 0;
  const showVideo = !!videoUrl && selected === images.length;
  const imageColor = getProductColors(colors).find((color) => color.image === images[selected] && color.hex === selectedColor);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!pointerFine || reducedMotion || showVideo) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ origin: `${x}% ${y}%`, scale: 1.6 });
  }

  function handleMouseLeave() {
    setZoom({ origin: "center", scale: 1 });
  }

  if (mediaCount === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-[var(--radius-card)] bg-ink-800 text-sm text-fg-subtle">
        Chưa có ảnh sản phẩm
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col-reverse gap-4 sm:flex-row">
      {mediaCount > 1 && (
        <div className="min-w-0 sm:relative sm:w-20 sm:shrink-0 sm:self-stretch">
        <div className="flex gap-3 overflow-x-auto sm:absolute sm:inset-0 sm:flex-col sm:overflow-x-hidden sm:overflow-y-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => { setActive(i); setZoom({ origin: "center", scale: 1 }); }}
              aria-label={`Xem ảnh ${i + 1}`}
              aria-current={selected === i}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-2 focus-visible:outline-brand motion-reduce:transition-none sm:w-20",
                selected === i ? "border-brand" : "border-transparent",
              )}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
          {videoUrl && (
            <button type="button" onClick={() => setActive(images.length)} aria-label={messages.product.video} aria-current={showVideo}
              className={cn("flex aspect-square w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 bg-ink-900 text-fg focus-visible:outline-2 focus-visible:outline-brand sm:w-20", showVideo ? "border-brand" : "border-ink-700")}>
              <Video className="h-5 w-5" aria-hidden="true" /><span className="text-xs">Video</span>
            </button>
          )}
        </div>
        </div>
      )}

      <div
        className="relative min-w-0 flex-1 touch-pan-y overflow-hidden rounded-[var(--radius-card)] bg-ink-800"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative aspect-square">
          {showVideo ? (
            <video key={videoUrl} src={videoUrl!} controls playsInline preload="none" aria-label={`${messages.product.video}: ${productName}`} className="absolute inset-0 h-full w-full object-contain">
              <a href={videoUrl!}>{messages.product.video}</a>
            </video>
          ) : <Image
            src={images[selected]}
            alt={`${productName}${imageColor ? ` — ${imageColor.name}` : ""}`}
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{ transformOrigin: zoom.origin, transform: `scale(${reducedMotion ? 1 : zoom.scale})` }}
          />}
        </div>
      </div>
    </div>
  );
}
