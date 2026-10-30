import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import type { Promo } from "@/lib/content";
import { formatPrice } from "@/lib/content";
import { formatDay } from "@/lib/offers";
import { PromoCarousel } from "./promo-carousel";
import { PromoFolder } from "./promo-folder";
import { WhatsAppCTA } from "./whatsapp-cta";

type Props = {
  promos: Promo[];
  lang: Locale;
  dict: Dictionary;
};

/**
 * The offers, in the hero where the proposal has its photo: the folder that
 * holds each coupon, the offer's line under it and the way to claim it, shown
 * one at a time. Each points down to its full card for the steps and sharing —
 * both read the same `promo`, so they never disagree.
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
    <div className="flex flex-col items-center px-6 pt-6 pb-8 text-center sm:px-10 lg:pt-8 lg:pb-10">
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
      <p className="mt-2 max-w-[440px] font-display text-[26px] leading-[1.15] font-normal text-balance sm:text-[30px]">
        {promo.title[lang]}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
        <WhatsAppCTA
          label={dict.promo.cta}
          variant="solid"
          prefill={dict.promo.prefill.replace("{offer}", promo.title[lang])}
          arrow
        />
        <a
          href={`#oferta-${promo.id}`}
          className="t-button-sm inline-flex min-h-11 items-center gap-5 border-b border-ink hover:border-clay hover:text-inherit"
        >
          {dict.promo.folder.howItWorks}
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </div>
  );
}
