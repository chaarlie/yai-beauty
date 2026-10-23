"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useSlideActive } from "./slide-context";

type Props = {
  /** The word on the front cover. */
  cover: string;
  /** Small print on the cover, e.g. the validity line; null leaves it blank. */
  note: string | null;
  /** Coupon eyebrow, e.g. "Especial del mes". */
  label: string;
  headline: string;
  /** The coupon's last line, e.g. "Valor RD$2,000"; null drops it. */
  value: string | null;
  /** Up to three; any beyond the sticker spots are dropped. */
  stickers: string[];
  openLabel: string;
  closeLabel: string;
};

// Coupon offsets, as a share of its own height: tucked in, peeking on hover, out.
const COUPON_Y = { closed: "-6%", peek: "-15%", open: "-62%" };

// Where each sticker lands once the coupon is out, relative to the folder body:
// straddling the coupon's top edge on the right, clear of its text.
const STICKER_SPOTS = [
  { left: "40%", top: "-74%", rotate: -8, z: 64, tone: "bg-ink text-cream" },
  { left: "60%", top: "-69%", rotate: 6, z: 78, tone: "bg-clay text-white" },
  { left: "76%", top: "-76%", rotate: -3, z: 70, tone: "bg-blush-300 text-ink" },
] as const;

const SMALL_PRINT = { fontSize: "max(9px, 2.4cqw)" };

/**
 * The promo as an object: a folder that slides its coupon out and stickers it.
 * It opens by itself the first time it is seen, and any tap toggles it. The
 * section around it carries the same offer as real text, so the button only
 * names the action and hides its artwork from screen readers.
 *
 * Layers stack with translateZ inside one preserve-3d plane (back, coupon,
 * cover, stickers) rather than z-index, which a 3D context ignores.
 */
export function PromoFolder({
  cover,
  note,
  label,
  headline,
  value,
  stickers,
  openLabel,
  closeLabel,
}: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  // In a carousel, only the slide showing counts; anywhere else this is always true.
  const active = useSlideActive();
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [hover, setHover] = useState(false);

  // Open on its own once seen and showing, unless the visitor got there first.
  useEffect(() => {
    if (!active || !seen || touched) return;
    const timer = setTimeout(() => setOpen(true), reduce ? 0 : 650);
    return () => clearTimeout(timer);
  }, [active, seen, touched, reduce]);

  // When its slide moves on, close and forget the visitor's tap, so the folder
  // opens again — the whole animation — each time the slide comes back.
  useEffect(() => {
    if (active) return;
    const timer = setTimeout(() => {
      setOpen(false);
      setTouched(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [active]);

  const spring = reduce ? { duration: 0 } : ({ type: "spring", stiffness: 170, damping: 20 } as const);

  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={open}
      aria-label={open ? closeLabel : openLabel}
      onClick={() => {
        setTouched(true);
        setOpen((current) => !current);
      }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      className="relative mx-auto block aspect-[20/19] w-full max-w-[400px] cursor-pointer text-left [container-type:inline-size] [perspective:1400px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay"
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-[12%] bottom-[1%] h-[12%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(26_22_20/0.28),transparent_72%)] blur-[14px]"
      />

      <motion.span
        aria-hidden="true"
        className="absolute top-[40%] left-[6%] h-[54%] w-[88%] [transform-style:preserve-3d]"
        style={{ transformOrigin: "50% 58%" }}
        initial={false}
        animate={{ rotateX: hover ? 9 : 6, rotateY: hover ? -6 : -3 }}
        transition={spring}
      >
        {/* Back panel and its tab. */}
        <span
          className="absolute top-[-10%] left-[8%] h-[11%] w-[36%] rounded-t-[7px] bg-[#8f675e] [clip-path:polygon(6%_0,94%_0,100%_100%,0_100%)]"
          style={{ transform: "translateZ(-16px)" }}
        />
        <span
          className="absolute inset-0 rounded-[4px_10px_10px_10px] bg-[#8f675e]"
          style={{ transform: "translateZ(-16px)" }}
        />

        {/* The coupon — Yai's own idea of the offer as "una especie de cupón". */}
        <motion.span
          className="absolute inset-y-0 right-[4%] left-[4%] rounded-[10px] bg-cream shadow-[0_18px_30px_rgb(26_22_20/0.16)]"
          style={{ z: -8 }}
          initial={false}
          animate={{ y: open ? COUPON_Y.open : hover ? COUPON_Y.peek : COUPON_Y.closed }}
          transition={spring}
        >
          <span className="absolute inset-x-[6%] top-[5%] flex flex-col rounded-[6px] border border-dashed border-clay/60 px-[6%] py-[4%]">
            <span className="t-label text-photo-caption" style={SMALL_PRINT}>
              {label}
            </span>
            <span
              className="mt-[1.5cqw] font-display leading-none font-light text-ink"
              style={{ fontSize: "max(24px, 8.5cqw)" }}
            >
              {headline}
            </span>
            {value ? (
              <span className="t-label mt-[2cqw] text-muted" style={SMALL_PRINT}>
                {value}
              </span>
            ) : null}
          </span>
        </motion.span>

        {/* Front cover — tips forward a little as the coupon comes out. */}
        <motion.span
          className="absolute inset-0 flex flex-col justify-between rounded-[10px] p-[6%] shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]"
          style={{
            background:
              "linear-gradient(172deg, rgb(255 255 255 / 0.16), rgb(255 255 255 / 0) 46%, rgb(0 0 0 / 0.14)), var(--color-clay)",
            transformOrigin: "50% 100%",
          }}
          initial={false}
          animate={{ rotateX: open ? -12 : 0 }}
          transition={spring}
        >
          <span className="flex items-center justify-between gap-3">
            <span className="t-label text-cream/75" style={SMALL_PRINT}>
              {note ?? ""}
            </span>
            <span className="size-[7px] shrink-0 rounded-full bg-cream shadow-[0_0_0_3px_rgb(251_243_238/0.25)]" />
          </span>
          <span
            className="font-display leading-[0.9] font-light text-cream [text-shadow:0_1px_0_rgb(0_0_0/0.18)]"
            style={{ fontSize: "max(40px, 17cqw)" }}
          >
            {cover}
          </span>
        </motion.span>

        {stickers.slice(0, STICKER_SPOTS.length).map((text, i) => {
          const spot = STICKER_SPOTS[i];
          return (
            <motion.span
              // Position, not text: Yasmin types these, and two could match.
              key={i}
              className={`absolute rounded-full border-[3px] border-white px-[3.2cqw] py-[1.3cqw] font-mono tracking-[0.12em] whitespace-nowrap uppercase shadow-[0_3px_6px_rgb(26_22_20/0.22)] ${spot.tone}`}
              style={{ left: spot.left, top: spot.top, fontSize: "max(10px, 2.5cqw)" }}
              initial={false}
              animate={
                open
                  ? { opacity: 1, scale: 1, rotate: spot.rotate, z: spot.z, y: 0 }
                  : { opacity: 0, scale: 0.6, rotate: 0, z: 0, y: 24 }
              }
              transition={
                reduce
                  ? { duration: 0 }
                  : open
                    ? { type: "spring", stiffness: 260, damping: 15, delay: 0.3 + i * 0.09 }
                    : { duration: 0.15 }
              }
            >
              {text}
            </motion.span>
          );
        })}
      </motion.span>
    </button>
  );
}
