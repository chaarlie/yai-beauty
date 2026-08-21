import Image from "next/image";

type Props = {
  /** Describes what belongs in the slot; also the alt text once `src` lands. */
  label: string;
  src?: string;
  className?: string;
  /** Chip sizing differs between the full-bleed slots and the gallery cells. */
  size?: "md" | "sm";
};

/**
 * All imagery is a placeholder — no real photography exists yet. The slot has
 * to read correctly both empty and filled, so the striped block is a first-class
 * state rather than a stand-in to be deleted later.
 */
export function PhotoSlot({ label, src, className, size = "md" }: Props) {
  const chip =
    size === "sm"
      ? "text-[10px] leading-[1.5] tracking-[0.1em] px-2.5 py-1.5 bg-blush-50 text-[#7a5a4c]"
      : "t-chip px-3.5 py-2 bg-cream";

  if (src) {
    return (
      <div className={`relative overflow-hidden ${className ?? ""}`}>
        <Image src={src} alt={label} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
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
