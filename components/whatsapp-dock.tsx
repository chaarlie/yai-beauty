import { getBusiness } from "@/lib/content";
import { whatsappUrl } from "@/lib/whatsapp";
import { SocialIcon } from "./social-icon";

/**
 * WhatsApp, always within reach, with the number on show.
 *
 * Her clients arrive almost entirely from an Instagram bio link on a phone, so
 * below `nav` the one action that converts gets a full-width bar at the foot of
 * the screen. From `nav` up it is a box floating in the bottom-right corner; the
 * layout's bottom padding lets the footer scroll clear of either.
 */
export function WhatsAppDock({ label, prefill }: { label: string; prefill?: string }) {
  const { phoneDisplay } = getBusiness();
  const href = whatsappUrl(prefill);

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-cream px-5 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] nav:hidden">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="t-button-sm flex min-h-12 items-center justify-center gap-3 bg-ink px-5 py-3 text-white hover:bg-[#574238] hover:text-white"
        >
          <SocialIcon name="whatsapp" />
          <span>
            {label}
            <span className="sr-only"> · WhatsApp</span>
          </span>
          <span aria-hidden="true" className="h-4 w-px bg-on-dark-field" />
          <span className="font-display text-[19px] leading-none tracking-[0.02em] text-clay-600">{phoneDisplay}</span>
        </a>
      </div>

      {/* The cream hairline keeps it visible as it passes over the dark contact band. */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="anim-rise fixed right-6 bottom-6 z-30 hidden items-center gap-3.5 border border-cream/25 bg-ink py-2.5 pr-5 pl-2.5 text-white [--anim-delay:0.6s] transition-[background-color,translate] duration-200 hover:-translate-y-0.5 hover:bg-[#574238] hover:text-white nav:flex lg:right-8 lg:bottom-8"
      >
        <span className="grid size-11 place-items-center bg-clay">
          <SocialIcon name="whatsapp" />
        </span>
        <span className="flex flex-col gap-1.5">
          <span className="t-label leading-none text-on-dark-caption">WhatsApp</span>
          <span className="font-display text-[23px] leading-none tracking-[0.02em]">{phoneDisplay}</span>
        </span>
      </a>
    </>
  );
}
