import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import type { Category, Service } from "@/lib/content";
import { formatPrice, serviceDisplayName, serviceName } from "@/lib/content";
import { whatsappUrl } from "@/lib/whatsapp";
import { PhotoSlot } from "./photo-slot";

type Group = { category: Category; services: Service[] };

type Props = {
  featured: Service[];
  /** Every service on offer by category, featured ones included: the price list. */
  groups: Group[];
  categories: Category[];
  lang: Locale;
  dict: Dictionary;
};

/**
 * The treatments worth a photograph get a row of their own — the photo beside a
 * card with the price, what the treatment does and a way to book it, the photo
 * alternating side to side. Below them the whole price list, one card per
 * category. Card names come from `serviceDisplayName`, the catalog's headline;
 * the price list leads with the plain name and keeps the headline under it.
 */
function FeaturedRow({
  service,
  number,
  category,
  lang,
  dict,
  flipped,
}: {
  service: Service;
  number: number;
  category: string;
  lang: Locale;
  dict: Dictionary;
  flipped: boolean;
}) {
  const name = serviceDisplayName(service, lang);
  const hasBenefits = service.benefits.length > 0;

  return (
    <article className="grid lg:min-h-[480px] lg:grid-cols-2">
      <PhotoSlot
        label={name}
        src={service.image}
        focus={service.imageFocus}
        parallax={service.imageParallax}
        className={`aspect-4/3 lg:aspect-auto lg:h-full ${flipped ? "lg:order-2" : ""}`}
      />
      <div className="reveal flex flex-col border border-rule bg-card px-6 py-7 sm:px-8 lg:px-12 lg:py-10">
        <p className="flex justify-between gap-4 text-[11px] leading-none tracking-[0.2em] text-muted">
          <span>{String(number).padStart(2, "0")}</span>
          <span className="uppercase">{category}</span>
        </p>
        <h3 className="mt-6 max-w-[420px] font-display text-[32px] leading-[1.08] font-light text-balance lg:mt-8 lg:text-[length:clamp(32px,3vw,42px)]">
          {name}
        </h3>
        <p className="mt-3 font-display text-[28px] leading-none text-accent">
          {formatPrice(service.price)}{" "}
          <span className="font-sans text-[12px] tracking-[0.02em] text-muted">{dict.treatments.perSession}</span>
        </p>
        {service.note ? <p className="t-label mt-4 text-muted">{service.note[lang]}</p> : null}
        {hasBenefits ? (
          <>
            <p className="t-label mt-7 text-muted">{dict.treatments.benefits}</p>
            <ul className="mt-3 max-w-[460px]">
              {service.benefits.map((benefit, i) => (
                <li
                  key={i}
                  className="relative border-b border-rule py-2.5 pl-6.5 text-[14px] leading-[1.6] text-secondary before:absolute before:top-[1.3em] before:left-0 before:h-px before:w-3 before:bg-clay last:border-b-0"
                >
                  {benefit[lang]}
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {/* One link for the whole foot of the card: a big target on a phone. */}
        <a
          href={whatsappUrl(`${dict.treatments.ctaPrefill}${name}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="group t-button-sm mt-7 flex items-center justify-between gap-4 border-t border-rule-card pt-5 hover:text-inherit lg:mt-auto"
        >
          {dict.treatments.cta}
          <span
            aria-hidden="true"
            className="grid size-11 shrink-0 place-items-center rounded-full border border-[#b7a495] text-[18px] transition-colors group-hover:bg-white"
          >
            ↗
          </span>
        </a>
      </div>
    </article>
  );
}

function PriceCard({ group, lang, dict }: { group: Group; lang: Locale; dict: Dictionary }) {
  const count = group.services.length;

  return (
    <section className="reveal border border-rule bg-card px-5 pt-6 pb-2 sm:px-8 sm:pt-7 sm:pb-4">
      <header className="flex items-baseline justify-between gap-3 border-b border-rule-card pb-3.5">
        <h4 className="font-display text-[30px] leading-none">{group.category[lang]}</h4>
        <span className="t-label text-muted">
          {count === 1 ? dict.treatments.countOne : dict.treatments.count.replace("{n}", String(count))}
        </span>
      </header>
      <ul>
        {group.services.map((service) => {
          const plain = serviceName(service, lang);
          const headline = serviceDisplayName(service, lang);
          return (
            <li key={service.slug} className="flex items-baseline gap-3 border-b border-rule py-3 last:border-b-0">
              <span className="flex flex-col text-[14px] leading-[1.5]">
                <span>{plain}</span>
                {headline !== plain ? <span className="text-[12px] text-muted">{headline}</span> : null}
                {service.note ? (
                  <span className="text-[10px] tracking-[0.16em] text-accent uppercase">{service.note[lang]}</span>
                ) : null}
              </span>
              <span aria-hidden="true" className="min-w-4 flex-1 -translate-y-1 border-b border-dotted border-[#bba797]" />
              <span className="font-display text-[20px] leading-none whitespace-nowrap">{formatPrice(service.price)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ServiceList({ featured, groups, categories, lang, dict }: Props) {
  const categoryName = (service: Service) => categories.find((c) => c.id === service.category)?.[lang] ?? "";

  return (
    <section id="tratamientos" className="section-x py-14 lg:py-22">
      <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="reveal t-eyebrow eyebrow-rule">{dict.nav.services}</p>
          <h2 className="reveal t-section-title mt-4">{dict.treatments.heading}</h2>
        </div>
        <p className="reveal max-w-[320px] text-[14px] leading-[1.65] text-muted">{dict.treatments.intro}</p>
      </div>

      <div className="grid gap-5">
        {featured.map((service, i) => (
          <FeaturedRow
            key={service.slug}
            service={service}
            number={i + 1}
            category={categoryName(service)}
            lang={lang}
            dict={dict}
            flipped={i % 2 === 1}
          />
        ))}
      </div>

      <div id="precios" className="mt-16 scroll-mt-28 lg:mt-18">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="reveal t-eyebrow">{dict.nav.prices}</p>
            <h3 className="reveal mt-3.5 font-display text-[30px] leading-[1.08] font-light lg:text-[40px]">
              {dict.treatments.allHeading}
            </h3>
          </div>
          <p className="reveal max-w-[300px] text-[13px] leading-[1.6] text-muted">{dict.treatments.pricesNote}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {groups.map((group) => (
            <PriceCard key={group.category.id} group={group} lang={lang} dict={dict} />
          ))}
        </div>
      </div>
    </section>
  );
}
