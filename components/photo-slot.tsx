import Image from "next/image";

type Props = {
  /** Describes what belongs in the slot; also the alt text once `src` lands. */
  label: string;
  src?: string;
  className?: string;
  /** Chip sizing differs between the full-bleed slots and the gallery cells. */
  size?: "md" | "sm";
  /**
   * Reveal the filled slot with a CSS scroll animation where supported. On by
   * default; turn it off for above-the-fold slots (the hero) that shouldn't wait.
   */
  reveal?: boolean;
  eager?: boolean;
  /** Keep important faces and hands inside responsive crops. */
  focus?: string;
  parallax?: boolean;
  /**
   * "calm" uses the softer CSS opacity reveal for the About portrait.
   */
  revealVariant?: "fade" | "calm";
};

/**
 * A photo slot that reads correctly both filled and empty. With `src` it shows
 * the photograph — drifting slightly on scroll via `.parallax`, and (when
 * `reveal`) fading in on entry after a deliberate delay. Without one it falls
 * back to the striped, labelled placeholder.
 *
 * CSS scroll effects are progressive enhancement: the server-rendered image
 * stays visible when JavaScript or scroll-animation support is unavailable.
 */
export function PhotoSlot({
  label,
  src,
  className,
  size = "md",
  reveal = true,
  eager = false,
  focus = "50% 50%",
  parallax = true,
  revealVariant = "fade",
}: Props) {
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
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        sizes="(max-width: 768px) 100vw, 50vw"
        className={`${parallax ? "parallax " : ""}object-cover`}
        style={{ objectPosition: focus }}
      />
    );

    if (!reveal) {
      return (
        <div className={`relative overflow-hidden ${className ?? ""}`}>
          {image}
        </div>
      );
    }

    return (
      <div className={`relative overflow-hidden ${revealVariant === "calm" ? "fade-in" : "reveal"} ${className ?? ""}`}>
        {image}
      </div>
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
