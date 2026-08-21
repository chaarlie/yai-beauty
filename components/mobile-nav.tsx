"use client";

import { useEffect, useState } from "react";
import type { NavItem } from "./site-header";

type Props = {
  items: NavItem[];
  openLabel: string;
  closeLabel: string;
};

/**
 * The nav collapses below 900px. Open/closed is the only piece of nav state on
 * the site, so it lives here rather than anywhere higher.
 */
export function MobileNav({ items, openLabel, closeLabel }: Props) {
  const [open, setOpen] = useState(false);

  // Body scroll lock only while the panel is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="nav:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen((v) => !v)}
        className="flex size-11 flex-col items-center justify-center gap-[5px]"
      >
        <span
          className={`block h-px w-5 bg-ink transition-transform duration-150 ${open ? "translate-y-[6px] rotate-45" : ""}`}
        />
        <span className={`block h-px w-5 bg-ink transition-opacity duration-150 ${open ? "opacity-0" : ""}`} />
        <span
          className={`block h-px w-5 bg-ink transition-transform duration-150 ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
        />
      </button>

      <div
        id="mobile-nav-panel"
        hidden={!open}
        className="absolute inset-x-0 top-full z-30 h-[calc(100dvh-100%)] overflow-y-auto border-t border-rule bg-cream px-6 py-8"
      >
        <nav className="flex flex-col">
          {items.map((item, i) => (
            <a
              key={`${item.href}-${i}`}
              href={item.href}
              onClick={() => setOpen(false)}
              className="t-nav flex min-h-11 items-center border-b border-rule py-4 text-secondary"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
