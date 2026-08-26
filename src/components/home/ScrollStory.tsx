"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { usePrefersReducedMotion } from "@/lib/hooks/useMediaQuery";

type StoryImage = { url: string | null; alt: string };
type StoryBlock = { heading: string; body: string };

/** GSAP ScrollTrigger pin + scrub: giày đứng yên, 3 khối chữ trôi qua (mục 5.1 PLAN.md). */
export function ScrollStory({
  storeName,
  images,
}: {
  storeName: string;
  images: StoryImage[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const blocks: StoryBlock[] = [
    {
      heading: "Chất liệu chọn lọc kỹ càng",
      body: `Da thuộc, vải canvas bền và cao su đúc nguyên khối — mỗi đôi ${storeName} đều bắt đầu từ nguyên liệu tốt nhất có thể tìm được.`,
    },
    {
      heading: "Vừa vặn với từng bước chân",
      body: "Phom giày được tinh chỉnh qua nhiều lần thử, đế giữa êm ái cho cả những ngày di chuyển nhiều nhất.",
    },
    {
      heading: "Bền theo năm tháng",
      body: "Đường khâu chắc chắn, xử lý chống thấm nhẹ và đế cao su chịu mài mòn — mua một lần, dùng được nhiều năm.",
    },
  ];

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const textEls = gsap.utils.toArray<HTMLElement>(".story-text", containerRef.current!);
      const imageEls = gsap.utils.toArray<HTMLElement>(".story-image", containerRef.current!);

      gsap.set(textEls, { opacity: 0, y: 40 });
      gsap.set(textEls[0], { opacity: 1, y: 0 });
      gsap.set(imageEls, { opacity: 0 });
      gsap.set(imageEls[0], { opacity: 1 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${window.innerHeight * 2}`,
          scrub: 1,
          pin: true,
        },
      });

      for (let i = 0; i < 2; i++) {
        timeline
          .to(textEls[i], { opacity: 0, y: -40, duration: 0.3 }, i)
          .to(textEls[i + 1], { opacity: 1, y: 0, duration: 0.3 }, i + 0.1)
          .to(imageEls[i], { opacity: 0, rotate: -8, duration: 0.3 }, i)
          .to(imageEls[i + 1], { opacity: 1, rotate: 0, duration: 0.3 }, i + 0.1);
      }
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-16">
          {blocks.map((block, i) => (
            <div key={block.heading} className="grid items-center gap-8 md:grid-cols-2">
              <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-ink-800">
                {images[i]?.url && (
                  <Image
                    src={images[i]!.url!}
                    alt={images[i]!.alt}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-fg">
                  {block.heading}
                </h3>
                <p className="mt-3 text-fg-muted">{block.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden">
      <div className="mx-auto grid h-full max-w-6xl grid-cols-1 items-center gap-8 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        <div className="relative order-2 aspect-square md:order-1">
          {images.map((img, i) => (
            <div
              key={i}
              className="story-image absolute inset-0 overflow-hidden rounded-[var(--radius-card)] bg-ink-800"
            >
              {img.url && (
                <Image src={img.url} alt={img.alt} fill className="object-cover" />
              )}
            </div>
          ))}
        </div>

        <div className="relative order-1 h-40 md:order-2 md:h-48">
          {blocks.map((block) => (
            <div key={block.heading} className="story-text absolute inset-0">
              <h3 className="font-display text-2xl font-bold text-fg sm:text-3xl">
                {block.heading}
              </h3>
              <p className="mt-3 max-w-md text-fg-muted">{block.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
