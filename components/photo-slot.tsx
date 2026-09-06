"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

type Props = {
  /** Describes what belongs in the slot; also the alt text once `src` lands. */
  label: string;
  src?: string;
  className?: string;
  /** Chip sizing differs between the full-bleed slots and the gallery cells. */
  size?: "md" | "sm";
  /**
   * Fade the filled slot in when it scrolls into view, after a short hold. On by
   * default; turn it off for above-the-fold slots (the hero) that shouldn't wait.
   */
  reveal?: boolean;
  /**
   * "calm" gives the About portrait a longer, later fade that also pulls out of a
   * soft blur — so the eye settles on it before reading.
   */
  revealVariant?: "fade" | "calm";
};

/**
 * A photo slot that reads correctly both filled and empty. With `src` it shows
 * the photograph — drifting slightly on scroll via `.parallax`, and (when
 * `reveal`) fading in on entry after a deliberate delay. Without one it falls
 * back to the striped, labelled placeholder.
 *
 * The entry fade is a time-based `whileInView` (a real delay, not scroll-linked),
 * which is why this is a client component. Trade-off: the image's `src`/`alt`
 * stay in the SSR HTML (so it's still indexable), but a visitor with JS disabled
 * sees the slot hold at opacity 0.
 */
export function PhotoSlot({
  label,
  src,
  className,
  size = "md",
  reveal = true,
  revealVariant = "fade",
}: Props) {
  const reduce = useReducedMotion();
  const chip =
    size === "sm"
      ? "text-[10px] leading-[1.5] tracking-[0.1em] px-2.5 py-1.5 bg-blush-50 text-[#7a5a4c]"
      : "t-chip px-3.5 py-2 bg-cream";

  if (src) {
    const image = (
      <Image
        src={src}
        alt={label}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="parallax object-cover"
      />
    );

    if (!reveal) {
      return (
        <div className={`relative overflow-hidden ${className ?? ""}`}>
          {image}
        </div>
      );
    }

    const calm = revealVariant === "calm";
    const ease = [0.22, 1, 0.36, 1] as const;

    return (
      <motion.div
        className={`relative overflow-hidden ${className ?? ""}`}
        initial={calm ? { opacity: 0, filter: "blur(8px)" } : { opacity: 0 }}
        whileInView={{ opacity: 1, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.3 }}
        transition={
          reduce
            ? { duration: 0 }
            : calm
              ? { delay: 0.5, duration: 1.1, ease }
              : { delay: 0.3, duration: 0.85, ease }
        }
      >
        {image}
      </motion.div>
    );
  }

  return (
    <div
      className={`flex items-end p-4 lg:p-7 ${className ?? ""}`}
      style={{
        background:
          size === "sm"
            ? "repeating-linear-gradient(115deg,#E9D2C6 0 12px,#E2C7B9 12px 24px)"
            : "repeating-linear-gradient(115deg,#F0DED4 0 14px,#EAD3C7 14px 28px)",
      }}
      role="img"
      aria-label={label}
    >
      <span className={`font-mono ${chip}`}>{label}</span>
    </div>
  );
}
