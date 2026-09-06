"use client";

import { useEffect, useState } from "react";

/**
 * Scroll-spy shared by the desktop nav underline and the mobile menu. The active
 * section is the last one (in document order) whose top has scrolled past a line
 * ~a third down the viewport — monotonic, so it steps through sections in order
 * and never falls into a gap (between sections, or across an un-ided block it
 * holds the previous one). rAF-throttled. Returns the active `#id` or null.
 */
export function useActiveSection(hrefs: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = hrefs.join("|");

  useEffect(() => {
    const els = [...new Set(hrefs)]
      .map((href) => document.getElementById(href.slice(1)))
      .filter((el): el is HTMLElement => el !== null)
      .sort((a, b) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );
    if (els.length === 0) return;

    let frame = 0;
    const compute = () => {
      frame = 0;
      const line = window.innerHeight * 0.33;
      let current: string | null = null;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      setActive(current ? `#${current}` : null);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return active;
}
