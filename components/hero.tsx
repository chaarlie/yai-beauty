import type { CSSProperties } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { Promo } from "@/lib/content";
import { imageUrl } from "@/lib/content";
import { PhotoSlot } from "./photo-slot";
import { PromoTeaser } from "./promo-teaser";
import { WhatsAppCTA } from "./whatsapp-cta";

type Stat = { value: string; label: string };

/** The proposal's trust band: three facts in a ruled row under the hero. */
function TrustBand({ stats }: { stats: Stat[] }) {
  return (
    <div className="section-x">
      <dl className="grid grid-cols-3 border-y border-rule py-5 lg:py-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col-reverse items-center gap-1 border-r border-rule px-2 text-center last:border-r-0 sm:flex-row-reverse sm:justify-center sm:gap-4 sm:text-left"
          >
            <dt className="max-w-[130px] text-[11px] leading-[1.5] text-muted sm:text-[12px]">{stat.label}</dt>
            <dd className="font-display text-[28px] leading-none font-normal sm:text-[34px]">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

type Props = {
  dict: Dictionary;
  lang: Locale;
  treatmentCount: number;
  /** Live offers. With any, the folder takes the visual's place; with none, Yai's photo does. */
  promos: Promo[];
};

export function Hero({ dict, lang, treatmentCount, promos }: Props) {
  const { hero } = dict;
  const stats: Stat[] = [
    { value: hero.stats.yearsValue, label: hero.stats.yearsLabel },
    { value: String(treatmentCount), label: hero.stats.treatmentsLabel },
    { value: hero.stats.evaluationValue, label: hero.stats.evaluationLabel },
  ];

  return (
    <>
      <section className="section-x">
        <div className="grid items-center gap-10 pt-10 pb-12 lg:grid-cols-[1.04fr_1fr] lg:gap-16 lg:pt-12 lg:pb-14 min-[1450px]:gap-24">
          <div>
            <p className="t-eyebrow anim-rise flex items-center gap-3 before:h-px before:w-7 before:bg-clay">
              {hero.eyebrow}
            </p>
            <h1
              className="anim-rise mt-6 font-display text-[52px] leading-[1.02] font-light tracking-[-0.02em] sm:text-[64px] lg:mt-7 lg:text-[length:clamp(56px,6.1vw,83px)]"
              style={{ "--anim-delay": "0.08s" } as CSSProperties}
            >
              {hero.titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <em className="block font-normal text-accent">{hero.titleAccent}</em>
            </h1>
            <p
              className="anim-rise mt-6 max-w-[420px] text-[16px] leading-[1.9] text-muted"
              style={{ "--anim-delay": "0.16s" } as CSSProperties}
            >
              {hero.body}
            </p>
            <div
              className="anim-rise mt-8 flex flex-wrap items-center gap-x-7 gap-y-4"
              style={{ "--anim-delay": "0.24s" } as CSSProperties}
            >
              <WhatsAppCTA label={hero.primaryCta} variant="solid" prefill={hero.prefill} arrow />
              <a
                href="#tratamientos"
                className="t-button-sm inline-flex min-h-11 items-center gap-5 border-b border-ink hover:border-clay hover:text-inherit"
              >
                {hero.secondaryCta}
                <span aria-hidden="true">↓</span>
              </a>
            </div>
            <p
              className="anim-rise mt-4 text-[12px] leading-[1.6] text-muted"
              style={{ "--anim-delay": "0.3s" } as CSSProperties}
            >
              {hero.note}
            </p>
          </div>

          {promos.length > 0 ? (
            <div className="anim-rise" style={{ "--anim-delay": "0.2s" } as CSSProperties}>
              <PromoTeaser promos={promos} lang={lang} dict={dict} />
            </div>
          ) : (
            <PhotoSlot
              label={hero.photoLabel}
              src={imageUrl("salon-areas/20261012_0099.webp")}
              reveal={false}
              eager
              parallax={false}
              focus="50% 30%"
              className="anim-rise aspect-4/5 max-h-[560px] w-full"
            />
          )}
        </div>
      </section>

      <TrustBand stats={stats} />
    </>
  );
}
