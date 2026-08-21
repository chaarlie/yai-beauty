import { whatsappUrl } from "@/lib/whatsapp";

type Variant = "solid" | "accent" | "text";

const VARIANTS: Record<Variant, string> = {
  // Ink fill — the header's primary action.
  solid: "bg-ink text-cream px-[22px] py-[13px] t-button-sm hover:bg-[#0f0c0b]",
  // Clay fill — the accent CTA used in the hero and the promo card.
  accent: "bg-clay text-white px-[30px] py-[18px] t-button hover:bg-[#a8776d]",
  // Underlined text — the hero's secondary action.
  text: "border-b border-ink px-1 py-[18px] t-button hover:border-clay",
};

type Props = {
  label: string;
  variant?: Variant;
  /** Prefilled `?text=` so Yai opens the chat already knowing why. */
  prefill?: string;
  className?: string;
};

/**
 * Every CTA on the page ends at WhatsApp. `min-h-11` holds the 44px minimum tap
 * target the prototype's buttons fall below at mobile sizes.
 */
export function WhatsAppCTA({ label, variant = "accent", prefill, className }: Props) {
  return (
    <a
      href={whatsappUrl(prefill)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 items-center justify-center text-center transition-colors duration-100 hover:text-inherit ${VARIANTS[variant]} ${className ?? ""}`}
    >
      {label}
    </a>
  );
}
