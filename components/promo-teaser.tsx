import type { CSSProperties } from "react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import type { Promo } from "@/lib/content";
import { formatPrice } from "@/lib/content";
import { formatDay } from "@/lib/offers";
import { offerShare } from "./offer-share";
import { PromoCarousel } from "./promo-carousel";
import { PromoFolder } from "./promo-folder";
import { ShareOffer } from "./share-offer";
import { WhatsAppCTA } from "./whatsapp-cta";

type Props = {
  promos: Promo[];
  lang: Locale;
  dict: Dictionary;
};

/**
 * The offers, first thing on the page: each one a short pitch beside the folder
 * that holds its coupon, shown one at a time. Each points down to its full card
 * for the steps — both read the same `promo`, so they never disagree.
 *
 * The pitches are paragraphs, not headings, so the hero's h1 stays the page's
 * first heading.
 */
export function PromoTeaser({ promos, lang, dict }: Props) {
  return (
    <PromoCarousel
      ids={promos.map((promo) => promo.id)}
      labels={dict.promo.carousel}
      slides={promos.map((promo) => (
        <PromoSlide key={promo.id} promo={promo} lang={lang} dict={dict} />
      ))}
    />
  );
}

function PromoSlide({ promo, lang, dict }: { promo: Promo; lang: Locale; dict: Dictionary }) {
  const value = promo.valueDOP === null ? null : formatPrice(promo.valueDOP);
  const validity = promo.endsOn ? dict.promo.validUntil.replace("{date}", formatDay(promo.endsOn, lang)) : null;

  return (
    <div className="section-x grid items-center gap-10 py-12 lg:grid-cols-[1fr_400px] lg:gap-16 lg:py-14">
      <div>
        <p className="t-eyebrow anim-rise">{promo.label[lang]}</p>
        <p
          className="anim-rise mt-5 max-w-[560px] font-display text-[30px] leading-[1.1] font-light text-balance lg:text-[44px]"
          style={{ "--anim-delay": "0.08s" } as CSSProperties}
        >
          {promo.title[lang]}
        </p>
        <div
          className="anim-rise mt-8 flex flex-wrap gap-4"
          style={{ "--anim-delay": "0.16s" } as CSSProperties}
        >
          <WhatsAppCTA
            label={dict.promo.cta}
            variant="accent"
            prefill={dict.promo.prefill.replace("{offer}", promo.title[lang])}
          />
          <a
            href={`#oferta-${promo.id}`}
            className="t-button inline-flex min-h-11 items-center border-b border-ink px-1 py-[18px] hover:border-clay"
          >
            {dict.promo.folder.howItWorks}
          </a>
        </div>
        <ShareOffer {...offerShare(promo, lang, dict)} tone="light" />
      </div>

      <PromoFolder
        cover={dict.nav.offers}
        note={validity}
        label={promo.label[lang]}
        headline={promo.badge[lang]}
        value={value === null ? null : `${dict.promo.value} ${value}`}
        stickers={[...promo.stickers.map((sticker) => sticker[lang]), ...(value === null ? [] : [value])]}
        openLabel={dict.promo.folder.open}
        closeLabel={dict.promo.folder.close}
      />
    </div>
  );
}
