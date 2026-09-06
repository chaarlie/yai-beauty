"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { NavItem } from "./site-header";
import { useActiveSection } from "./use-active-section";

type Props = {
  items: NavItem[];
  label: string;
};

/**
 * Desktop nav with a single shared underline that slides and resizes between
 * items — the Framer `layoutId` move. The highlighted item is whatever the
 * cursor is over; with no hover it falls back to the section currently in view
 * (scroll-spy). This is the only interactive nav state on desktop, so it lives
 * in its own client island and the header stays a server component.
 */
export function PrimaryNav({ items, label }: Props) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);
  const activeHref = useActiveSection(items.map((item) => item.href));

  const activeIndex =
    activeHref != null ? items.findIndex((item) => item.href === activeHref) : -1;
  const highlighted = hovered ?? (activeIndex >= 0 ? activeIndex : null);

  return (
    <nav
      aria-label={label}
      className="relative hidden nav:flex nav:gap-[34px]"
      onMouseLeave={() => setHovered(null)}
    >
      {items.map((item, i) => {
        const isOn = highlighted === i;
        return (
          <a
            key={`${item.href}-${i}`}
            href={item.href}
            onMouseEnter={() => setHovered(i)}
            aria-current={activeIndex === i ? "true" : undefined}
            className={`t-nav relative py-1 transition-colors duration-200 hover:text-inherit ${
              isOn ? "text-ink" : "text-secondary"
            }`}
          >
            {item.label}
            {isOn ? (
              <motion.span
                layoutId="nav-underline"
                className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-clay"
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 34 }
                }
              />
            ) : null}
          </a>
        );
      })}
    </nav>
  );
}
