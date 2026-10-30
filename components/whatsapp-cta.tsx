import { whatsappUrl } from "@/lib/whatsapp";

type Variant = "solid" | "accent" | "text";

const VARIANTS: Record<Variant, string> = {
  // Ink fill — the main action: header, hero, offer.
  solid: "min-h-12 bg-ink px-[23px] py-3.5 text-white t-button-sm hover:-translate-y-0.5 hover:bg-[#574238] hover:text-white",
  // Clay fill — the promo card on the dark block.
  accent: "bg-clay text-white px-[30px] py-[18px] t-button hover:bg-[#a8776d] hover:text-white",
  // Underlined text — a secondary action.
  text: "border-b border-ink px-1 py-[18px] t-button hover:border-clay hover:text-inherit",
};

type Props = {
  label: string;
  variant?: Variant;
  /** Prefilled `?text=` so Yai opens the chat already knowing why. */
  prefill?: string;
  /** A trailing ↗: it leaves the site for WhatsApp. */
  arrow?: boolean;
  className?: string;
};

/**
 * Every CTA on the page ends at WhatsApp. `min-h-11` holds the 44px minimum tap
 * target the prototype's buttons fall below at mobile sizes.
 */
export function WhatsAppCTA({ label, variant = "accent", prefill, arrow = false, className }: Props) {
  return (
    <a
      href={whatsappUrl(prefill)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 items-center justify-center gap-6 text-center transition-[color,background-color,border-color,translate] duration-200 ${VARIANTS[variant]} ${className ?? ""}`}
    >
      {label}
      {arrow ? <span aria-hidden="true">↗</span> : null}
    </a>
  );
}
