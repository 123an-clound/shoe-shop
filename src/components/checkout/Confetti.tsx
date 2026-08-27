const COLORS = [
  "var(--brand-primary)",
  "var(--brand-secondary)",
  "var(--brand-accent)",
  "var(--color-neon-lime)",
];
const PIECE_COUNT = 40;

/**
 * Confetti CSS thuần, vị trí/độ trễ tính từ chỉ số (không dùng Math.random) để
 * không lệch giữa server và client. Tự tắt khi prefers-reduced-motion.
 */
export function Confetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      {Array.from({ length: PIECE_COUNT }, (_, i) => {
        const left = (i * 53) % 100;
        const delay = (i % 12) * 0.12;
        const duration = 2.4 + (i % 5) * 0.3;
        const size = 5 + (i % 4) * 2;

        return (
          <span
            key={i}
            className="absolute top-[-5%] motion-safe:animate-confetti-fall"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 1.6,
              backgroundColor: COLORS[i % COLORS.length],
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}
