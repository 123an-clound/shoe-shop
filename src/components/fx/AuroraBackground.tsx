/**
 * Ba khối gradient mờ trôi chậm phía sau nội dung, dùng màu thương hiệu
 * (var(--brand-*) qua các token bg-brand/bg-brand-2/bg-brand-3). Thuần CSS
 * keyframes nên không cần "use client"; `motion-safe:` tự tắt animation khi
 * người dùng bật prefers-reduced-motion.
 */
export function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-[10%] -top-[10%] h-[60vmax] w-[60vmax] rounded-full bg-brand opacity-30 blur-[120px] motion-safe:animate-aurora-1" />
      <div className="absolute -right-[15%] top-[5%] h-[55vmax] w-[55vmax] rounded-full bg-brand-2 opacity-25 blur-[120px] motion-safe:animate-aurora-2" />
      <div className="absolute -bottom-[20%] left-[15%] h-[50vmax] w-[50vmax] rounded-full bg-brand-3 opacity-20 blur-[120px] motion-safe:animate-aurora-3" />
    </div>
  );
}
