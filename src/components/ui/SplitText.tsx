"use client";

import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/cn";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};

const charVariants: Variants = {
  hidden: { opacity: 0, y: "0.6em" },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Tách chữ theo ký tự, bay lên so le khi vào trang (mục 5.1/6 PLAN.md).
 * Giữ nguyên văn bản thật qua `aria-label` cho trình đọc màn hình.
 */
export function SplitText({
  text,
  as: Tag = "span",
  className,
  wordClassName,
}: {
  text: string;
  as?: "h1" | "h2" | "span";
  className?: string;
  wordClassName?: string;
}) {
  const words = text.split(" ");

  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        aria-hidden="true"
        initial="hidden"
        animate="visible"
        variants={container}
        className="inline"
      >
        {words.map((word, wordIndex) => (
          <span
            key={wordIndex}
            className={cn("inline-block whitespace-nowrap", wordClassName)}
          >
            {word.split("").map((char, charIndex) => (
              <motion.span
                key={charIndex}
                variants={charVariants}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
            {wordIndex < words.length - 1 ? " " : ""}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
