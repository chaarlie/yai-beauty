"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { SlideContext } from "./slide-context";

export type CarouselLabels = {
  label: string;
  previous: string;
  next: string;
  slide: string;
  goTo: string;
  pause: string;
  play: string;
};

type Props = {
  /** Offer ids, one per slide — keys, and the `#oferta-<id>` a shared link carries. */
  ids: string[];
  /** Server-rendered slides; the carousel only decides which one shows. */
  slides: ReactNode[];
  labels: CarouselLabels;
};

const INTERVAL_MS = 6000;
const SWIPE_PX = 50;

/**
 * Every live offer, one at a time. All slides stay in the HTML, stacked in one
 * grid cell so the tallest sets the height and nothing jumps; the hidden ones are
 * `inert`, so neither keyboard nor screen reader lands in them.
 *
 * It moves on by itself every few seconds. It doesn't pause on hover — it spans
 * the top of the page, so the pointer is nearly always over it — nor on a click:
 * only keyboard focus inside it holds it still, and only the pause button stops
 * it. Arrows, dots and swipes restart the countdown from the slide they land on.
 * Reduced motion means no autoplay and no slide.
 */
export function PromoCarousel({ ids, slides, labels }: Props) {
  const reduce = useReducedMotion();
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [stopped, setStopped] = useState(false);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const playing = count > 1 && !stopped && !keyboardFocus && !reduce;

  // A link to #oferta-<id> starts on that offer. After hydration, so the server
  // and the first client render agree on slide one.
  useEffect(() => {
    const at = ids.findIndex((id) => window.location.hash === `#oferta-${id}`);
    if (at <= 0) return;
    const timer = setTimeout(() => setIndex(at), 0);
    return () => clearTimeout(timer);
  }, [ids]);

  // One timeout per slide, rather than an interval: landing on a slide by hand
  // restarts the countdown, so it never jumps away a second after a click.
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [playing, count, index]);

  if (count === 0) return null;

  const go = (to: number) => setIndex(((to % count) + count) % count);
  const fill = (template: string, n: number) => template.replace("{n}", String(n)).replace("{total}", String(count));

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === "touch") swipe.current = { x: event.clientX, y: event.clientY };
  }
  function onPointerUp(event: PointerEvent) {
    const start = swipe.current;
    swipe.current = null;
    if (!start || count < 2) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(event.clientY - start.y)) go(index + (dx < 0 ? 1 : -1));
  }
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowRight") go(index + 1);
    else if (event.key === "ArrowLeft") go(index - 1);
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={labels.label}
      // The panel is the section's own, so a change of slide moves the offer
      // across it rather than the panel with it.
      className="promo-panel relative touch-pan-y overflow-x-clip"
      // Keyboard focus only: a mouse click focuses the folder or a share button
      // too, and that shouldn't freeze the carousel.
      onFocus={(event) => {
        if (event.target instanceof HTMLElement && event.target.matches(":focus-visible")) setKeyboardFocus(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setKeyboardFocus(false);
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipe.current = null)}
    >
      {/* Announces a change the visitor made; silent while it plays by itself. */}
      <div className="grid" aria-live={playing ? "off" : "polite"}>
        {slides.map((slide, i) => {
          const current = i === index;
          const offset = i < index ? "-translate-x-8" : "translate-x-8";
          return (
            <div
              key={ids[i]}
              role="group"
              aria-roledescription="slide"
              aria-label={fill(labels.slide, i + 1)}
              aria-hidden={!current}
              inert={!current}
              className={`[grid-area:1/1] ${reduce ? "" : "transition-[opacity,translate] duration-500 ease-out"} ${current ? "opacity-100" : `pointer-events-none opacity-0 ${reduce ? "" : offset}`}`}
            >
              <SlideContext.Provider value={{ active: current }}>{slide}</SlideContext.Provider>
            </div>
          );
        })}
      </div>

      {count > 1 ? (
        // Along the panel's foot: where the offer is on the left, moving on on the right.
        <div
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-rule px-3 py-2 sm:px-5"
          onKeyDown={onKeyDown}
        >
          <div className="flex items-center">
            {ids.map((id, i) => (
              <button
                key={id}
                type="button"
                onClick={() => go(i)}
                aria-label={fill(labels.goTo, i + 1)}
                aria-current={i === index ? "true" : undefined}
                className="group grid size-11 place-items-center"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-8 bg-ink" : "w-1.5 bg-clay-600 group-hover:bg-clay"}`}
                />
              </button>
            ))}
            <span className="t-label ml-1 text-muted" aria-hidden="true">
              {index + 1} / {count}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!reduce ? (
              <button
                type="button"
                onClick={() => setStopped((value) => !value)}
                className="t-button-sm min-h-11 px-3 text-secondary hover:text-ink"
              >
                {stopped ? labels.play : labels.pause}
              </button>
            ) : null}
            <ArrowButton label={labels.previous} onClick={() => go(index - 1)} glyph="←" />
            <ArrowButton label={labels.next} onClick={() => go(index + 1)} glyph="→" />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ArrowButton({ label, onClick, glyph }: { label: string; onClick: () => void; glyph: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-11 place-items-center rounded-full border border-rule-button text-[18px] text-ink transition-colors hover:border-clay hover:bg-cream"
    >
      <span aria-hidden="true">{glyph}</span>
    </button>
  );
}
