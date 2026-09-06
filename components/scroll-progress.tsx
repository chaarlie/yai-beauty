"use client";

import { motion, useScroll } from "motion/react";

/**
 * A reading-progress bar pinned to the bottom edge of the sticky header. Its
 * scaleX is driven straight off page scroll, so it reports where you are in the
 * page. Decorative-informational, hence aria-hidden; it maps position rather
 * than animating on its own, so it's left on under reduced-motion.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: scrollYProgress }}
      className="absolute inset-x-0 bottom-[-1px] h-[3px] origin-left bg-clay"
    />
  );
}
