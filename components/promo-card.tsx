import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import type { Promo } from "@/lib/content";
import { formatPrice } from "@/lib/content";
import { formatDay } from "@/lib/offers";
import { offerShare } from "./offer-share";
import { ShareOffer } from "./share-offer";
import { WhatsAppCTA } from "./whatsapp-cta";

type Props = {
  promo: Promo;
  lang: Locale;
  dict: Dictionary;
};

/**
 * One offer in full, as the proposal's blush strip: a tilted stamp with the
 * coupon's words, the offer and its steps, the small print and sharing, and the
 * way to claim it. The page stacks one per live offer inside #ofertas; each
 * answers to `#oferta-<id>`, where the hero's "Cómo funciona" points.
 */
export function PromoCard({ promo, lang, dict }: Props) {
  const validity = promo.endsOn ? dict.promo.validUntil.replace("{date}", formatDay(promo.endsOn, lang)) : null;
  const value = promo.valueDOP === null ? null : `${dict.promo.value} ${formatPrice(promo.valueDOP)}`;
  const smallPrint = [validity, value].filter(Boolean).join(" · ");

  return (
    <article
      id={`oferta-${promo.id}`}
      className="reveal grid scroll-mt-28 items-center gap-5 bg-offer px-5.5 py-7 sm:px-8 md:grid-cols-[auto_minmax(0,1fr)] md:gap-x-8 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-x-9 lg:px-11 lg:py-9"
    >
      <div
        aria-hidden="true"
        className="hidden size-24 -rotate-12 place-items-center rounded-full border border-[#ad8572] p-2.5 text-center font-display text-[21px] leading-[1.05] text-balance md:grid"
      >
        {promo.badge[lang]}
      </div>

      <div>
        <p className="t-eyebrow">
          {promo.heading[lang]} · {promo.label[lang]}
        </p>
        <h2 className="mt-2.5 font-display text-[28px] leading-[1.1] text-balance lg:text-[length:clamp(28px,2.8vw,36px)]">
          {promo.title[lang]}
        </h2>
        <p className="mt-2.5 max-w-[560px] text-[14px] leading-[1.65] text-offer-text">{promo.body[lang]}</p>

        {promo.steps.length > 0 ? (
          <ol className="mt-5.5 grid gap-3 border-t border-rule-stat pt-4.5 sm:grid-cols-3 sm:gap-5.5">
            {promo.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-[13px] leading-[1.5]">
                <span className="font-mono text-[12px] text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span>{step[lang]}</span>
              </li>
            ))}
          </ol>
        ) : null}

        <div className="mt-5.5 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          {smallPrint ? <p className="t-label mt-3 text-muted">{smallPrint}</p> : <span />}
          <ShareOffer {...offerShare(promo, lang, dict)} tone="light" className="" />
        </div>
      </div>

      <div className="flex flex-col items-start gap-2.5 md:col-span-2 lg:col-span-1 lg:items-center lg:text-center">
        <WhatsAppCTA
          label={dict.promo.cta}
          variant="solid"
          prefill={dict.promo.prefill.replace("{offer}", promo.title[lang])}
          arrow
        />
        <p className="text-[11px] leading-[1.5] text-offer-text">{dict.promo.caption}</p>
      </div>
    </article>
  );
}
