"use client";

import { useEffect, useRef, useState } from "react";
import type { NavItem } from "./site-header";
import { useActiveSection } from "./use-active-section";

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
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const activeHref = useActiveSection(items.map((item) => item.href));
  const activeIndex = activeHref ? items.findIndex((item) => item.href === activeHref) : -1;

  // Body scroll lock only while the panel is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 900px)");
    const onResize = () => { if (desktop.matches) setOpen(false); };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        trigger.current?.focus();
      }
      if (event.key === "Tab") {
        const links = Array.from(panel.current?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? []);
        const first = trigger.current;
        const last = links.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first?.focus();
        }
      }
    };
    panel.current?.querySelector<HTMLAnchorElement>("a[href]")?.focus();
    desktop.addEventListener("change", onResize);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      desktop.removeEventListener("change", onResize);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="nav:hidden">
      <button
        ref={trigger}
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
        ref={panel}
        id="mobile-nav-panel"
        hidden={!open}
        className="absolute inset-x-0 top-full z-30 h-[calc(100dvh-100%)] overflow-y-auto border-t border-rule bg-cream px-6 py-8"
      >
        <nav className="flex flex-col">
          {items.map((item, i) => {
            const isActive = activeIndex === i;
            return (
              <a
                key={`${item.href}-${i}`}
                href={item.href}
                onClick={() => { setOpen(false); trigger.current?.focus(); }}
                aria-current={isActive ? "true" : undefined}
                className={`t-nav relative flex min-h-11 items-center border-b border-rule py-4 pl-4 transition-colors duration-200 ${
                  isActive ? "text-ink" : "text-secondary"
                }`}
              >
                {isActive ? (
                  <span className="absolute top-3 bottom-3 left-0 w-[2px] bg-clay" />
                ) : null}
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
