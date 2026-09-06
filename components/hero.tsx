import type { CSSProperties } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import { PhotoSlot } from "./photo-slot";
import { WhatsAppCTA } from "./whatsapp-cta";

type Stat = { value: string; label: string };

function StatRow({ stats }: { stats: Stat[] }) {
  return (
    <dl className="mt-10 flex flex-wrap gap-x-11 gap-y-6 border-t border-rule-stat pt-7 lg:mt-16">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dd className="font-display text-[34px] leading-none font-light">{stat.value}</dd>
          <dt className="t-label mt-1.5 text-muted">{stat.label}</dt>
        </div>
      ))}
    </dl>
  );
}

export function Hero({ dict, treatmentCount }: { dict: Dictionary; treatmentCount: number }) {
  const { hero } = dict;
  const stats: Stat[] = [
    { value: hero.stats.yearsValue, label: hero.stats.yearsLabel },
    { value: String(treatmentCount), label: hero.stats.treatmentsLabel },
    { value: hero.stats.evaluationValue, label: hero.stats.evaluationLabel },
  ];

  return (
    <section className="grid lg:min-h-[660px] lg:grid-cols-[1.05fr_0.95fr]">
      {/* Image first in the DOM would put a placeholder above the H1 on mobile,
          so it is ordered after the copy and only re-ordered at lg. */}
      <div className="section-x flex flex-col justify-center py-14 lg:pt-[110px] lg:pb-[90px]">
        <p className="t-eyebrow anim-rise">{hero.eyebrow}</p>
        <h1
          className="anim-rise mt-6 font-display text-[40px] leading-[1.05] font-light tracking-[-0.01em] text-balance sm:text-[56px] lg:mt-[26px] lg:text-[76px] lg:leading-[1.02]"
          style={{ "--anim-delay": "0.08s" } as CSSProperties}
        >
          {hero.title}
        </h1>
        <p
          className="anim-rise mt-7 max-w-[440px] text-[18px] leading-[1.7] font-light text-secondary"
          style={{ "--anim-delay": "0.16s" } as CSSProperties}
        >
          {hero.body}
        </p>
        <div
          className="anim-rise mt-10 flex flex-wrap gap-4"
          style={{ "--anim-delay": "0.24s" } as CSSProperties}
        >
          <WhatsAppCTA label={hero.primaryCta} variant="accent" prefill={hero.prefill} />
          <a
            href="#tratamientos"
            className="t-button inline-flex min-h-11 items-center border-b border-ink px-1 py-[18px] hover:border-clay"
          >
            {hero.secondaryCta}
          </a>
        </div>
        <div className="anim-rise" style={{ "--anim-delay": "0.32s" } as CSSProperties}>
          <StatRow stats={stats} />
        </div>
      </div>

      <PhotoSlot
        label={hero.photoLabel}
        src="/images/hero-yai.webp"
        reveal={false}
        className="anim-rise order-first min-h-[280px] lg:order-none lg:min-h-full"
      />
    </section>
  );
}
