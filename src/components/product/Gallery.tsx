"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Video } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
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
  const { locale, messages } = useLocaleContext();
  const [zoomOpen, setZoomOpen] = useState(false);
  const zoomRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const mediaCount = images.length + (videoUrl ? 1 : 0);
  const selected = active < mediaCount ? active : 0;
  const showVideo = !!videoUrl && selected === images.length;
  const imageColor = getProductColors(colors).find((color) => color.image === images[selected] && color.hex === selectedColor);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!pointerFine || reducedMotion || showVideo) return;
    const node = e.currentTarget, clientX = e.clientX, clientY = e.clientY;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = node.getBoundingClientRect();
      node.style.setProperty("--zoom-origin", `${((clientX - rect.left) / rect.width) * 100}% ${((clientY - rect.top) / rect.height) * 100}%`);
      node.style.setProperty("--zoom-scale", "1.6");
    });
  }

  function handleMouseLeave() {
    cancelAnimationFrame(frame.current);
    zoomRef.current?.style.removeProperty("--zoom-origin");
    zoomRef.current?.style.removeProperty("--zoom-scale");
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
              onClick={() => { setActive(i); handleMouseLeave(); }}
              aria-label={locale === "en" ? `View image ${i + 1}` : `Xem ảnh ${i + 1}`}
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
        ref={zoomRef}
        className="relative min-w-0 flex-1 overflow-hidden rounded-[var(--radius-card)] bg-ink-800 [touch-action:pan-y_pinch-zoom]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={(event) => { touch.current = !showVideo && event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }}
        onTouchMove={(event) => { if (event.touches.length !== 1) touch.current = null; }}
        onTouchCancel={() => { touch.current = null; }}
        onTouchEnd={(event) => {
          const start = touch.current; touch.current = null;
          if (!start || !event.changedTouches[0] || mediaCount < 2) return;
          const dx = event.changedTouches[0].clientX - start.x, dy = event.changedTouches[0].clientY - start.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { setActive((selected + (dx < 0 ? 1 : -1) + mediaCount) % mediaCount); handleMouseLeave(); }
        }}
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
            loading={selected === 0 ? "eager" : "lazy"}
            fetchPriority={selected === 0 ? "high" : "auto"}
            decoding={selected === 0 ? "sync" : "async"}
            sizes="(min-width: 1280px) 488px, (min-width: 1024px) calc(50vw - 160px), (min-width: 640px) calc(100vw - 144px), calc(100vw - 32px)"
            className="object-cover transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{ transformOrigin: "var(--zoom-origin, center)", transform: `scale(${reducedMotion || !pointerFine ? 1 : "var(--zoom-scale, 1)"})` }}
          />}
        </div>
        {!showVideo && <button type="button" aria-label={locale === "en" ? "Enlarge image" : "Phóng to ảnh"} onClick={(event) => { event.currentTarget.focus({ preventScroll: true }); setZoomOpen(true); }}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-ink-700 bg-ink-950 text-fg focus-visible:outline-2 focus-visible:outline-brand"><Maximize2 className="h-5 w-5" aria-hidden="true" /></button>}
        {mediaCount > 1 && !showVideo && <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
          <button type="button" aria-label={locale === "en" ? "Previous image" : "Ảnh trước"} onClick={() => { setActive((selected - 1 + mediaCount) % mediaCount); handleMouseLeave(); }} className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-700 bg-ink-950 text-fg focus-visible:outline-2 focus-visible:outline-brand"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
          <span role="status" className="rounded-full bg-ink-950 px-3 py-1 text-sm tabular-nums text-fg">{selected + 1} / {mediaCount}</span>
          <button type="button" aria-label={locale === "en" ? "Next image" : "Ảnh tiếp"} onClick={() => { setActive((selected + 1) % mediaCount); handleMouseLeave(); }} className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-700 bg-ink-950 text-fg focus-visible:outline-2 focus-visible:outline-brand"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
        </div>}
      </div>
      <Drawer open={zoomOpen} onClose={() => setZoomOpen(false)} side="full" title={productName} closeLabel={locale === "en" ? "Close image" : "Đóng ảnh"}>
        {images[selected] && <div className="relative h-full min-h-64 w-full"><Image src={images[selected]} alt={productName} fill sizes="100vw" className="object-contain" /></div>}
      </Drawer>
    </div>
  );
}
