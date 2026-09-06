import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import type { Promo } from "@/lib/content";
import { formatPrice } from "@/lib/content";
import { WhatsAppCTA } from "./whatsapp-cta";

type Props = {
  promo: Promo;
  lang: Locale;
  dict: Dictionary;
};

/**
 * The strongest visual break on the page — the only dark block above the
 * fold-and-a-half. Everything here is driven by `promo` in the content layer,
 * including whether it renders at all.
 */
export function PromoCard({ promo, lang, dict }: Props) {
  return (
    <section id="ofertas" className="section-x border-t border-rule py-16 lg:py-22">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-[34px]">
        <div>
          <p className="reveal t-eyebrow">{promo.label[lang]}</p>
          <h2 className="reveal mt-4 font-display text-[32px] leading-[1.1] font-light lg:text-[46px]">
            {dict.promo.heading}
          </h2>
        </div>
        <p className="t-label-wide text-muted sm:text-right">{dict.promo.validThrough}</p>
      </div>

      <div className="grid bg-ink text-cream lg:grid-cols-[1.25fr_0.75fr]">
        <div className="flex flex-col justify-between gap-9 px-7 py-12 lg:px-13 lg:py-14">
          <div>
            <span className="t-label-wide inline-block bg-clay px-3.5 py-2.5 tracking-[0.22em] text-white">
              {dict.promo.badge}
            </span>
            <h3 className="mt-6 max-w-[560px] font-display text-[34px] leading-[1.08] font-light text-balance lg:text-[54px] lg:leading-[1.06]">
              {promo.title[lang]}
            </h3>
            <p className="mt-5 max-w-[480px] text-[17px] leading-[1.7] font-light text-on-dark-intro">
              {promo.body[lang]}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-[26px] gap-y-4">
            <WhatsAppCTA label={dict.promo.cta} variant="accent" prefill={dict.promo.prefill} />
            <span className="text-sm leading-[1.6] font-light text-on-dark-caption">
              {dict.promo.caption}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-center bg-ink-raised px-7 py-12 lg:px-11 lg:py-14">
          <ol>
            {promo.steps.map((step, i) => (
              <li
                key={step.es}
                className="flex gap-[18px] border-b border-rule-dark py-[22px] first:pt-0 last:border-b-0 last:pb-0"
              >
                <span className="font-mono text-[13px] leading-[1.5] font-light text-clay">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[15px] leading-[1.6] font-light text-on-dark-body">
                  {step[lang]}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-[34px] border-t border-rule-dark pt-[22px]">
            <p className="text-[12px] leading-none font-light tracking-[0.16em] uppercase text-on-dark-label">
              {dict.promo.value}
            </p>
            <p className="mt-2 font-display text-[32px] leading-none font-light text-blush-300">
              {formatPrice(promo.valueDOP)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
