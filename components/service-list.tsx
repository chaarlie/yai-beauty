import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import type { Category, Service } from "@/lib/content";
import { formatPrice, serviceDisplayName } from "@/lib/content";
import { PhotoSlot } from "./photo-slot";
import { WhatsAppCTA } from "./whatsapp-cta";

type Group = { category: Category; services: Service[] };

type Props = {
  featured: Service[];
  groups: Group[];
  lang: Locale;
  dict: Dictionary;
};

/**
 * Modelled on the printed catalog: the treatments worth a photograph get a full
 * row with the image alternating side to side, and the rest are grouped by
 * category as a priced list. Names come from `serviceDisplayName`, which prefers
 * the catalog's headline over the functional name.
 */
function FeaturedRow({
  service,
  lang,
  dict,
  flipped,
}: {
  service: Service;
  lang: Locale;
  dict: Dictionary;
  flipped: boolean;
}) {
  const name = serviceDisplayName(service, lang);

  return (
    <article className="grid items-center gap-8 border-t border-rule py-10 lg:grid-cols-2 lg:gap-16 lg:py-14">
      <PhotoSlot
        label={name}
        src={service.image}
        className={`aspect-4/5 sm:aspect-3/2 lg:aspect-4/5 ${flipped ? "lg:order-2" : ""}`}
      />
      <div className={`reveal ${flipped ? "lg:order-1" : ""}`}>
        <h3 className="max-w-[420px] font-display text-[30px] leading-[1.15] font-light text-balance lg:text-[40px]">
          {name}
        </h3>
        <p className="mt-3 font-display text-[26px] leading-none font-light text-muted lg:text-[30px]">
          {formatPrice(service.price)}
        </p>
        {service.note ? (
          <p className="t-label mt-4 text-muted">{service.note[lang]}</p>
        ) : null}
        <WhatsAppCTA
          label={dict.treatments.cta}
          variant="text"
          prefill={`${dict.treatments.ctaPrefill}${name}`}
          className="mt-6"
        />
      </div>
    </article>
  );
}

export function ServiceList({ featured, groups, lang, dict }: Props) {
  return (
    <section id="tratamientos">
      <div className="section-x flex flex-col gap-4 border-t border-rule pt-16 pb-5 sm:flex-row sm:items-end sm:justify-between lg:pt-24">
        <h2 className="reveal font-display text-[32px] leading-[1.1] font-light lg:text-[46px]">
          {dict.treatments.heading}
        </h2>
        <p className="reveal max-w-[380px] text-[15px] leading-[1.7] font-light text-tertiary">
          {dict.treatments.intro}
        </p>
      </div>

      <div className="section-x">
        {featured.map((service, i) => (
          <FeaturedRow
            key={service.slug}
            service={service}
            lang={lang}
            dict={dict}
            flipped={i % 2 === 1}
          />
        ))}
      </div>

      <div className="section-x border-t border-rule pt-14 pb-16 lg:pb-24">
        <h3 className="reveal t-label-wide mb-8 text-muted">{dict.treatments.allHeading}</h3>

        <div className="grid gap-x-16 gap-y-10 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group.category.id}>
              <h4 className="t-label border-b border-rule pb-3 text-eyebrow">
                {group.category[lang]}
              </h4>
              <ul>
                {group.services.map((service) => (
                  <li
                    key={service.slug}
                    className="flex items-baseline justify-between gap-4 border-b border-rule py-4"
                  >
                    <span className="font-display text-[17px] leading-[1.4]">
                      {serviceDisplayName(service, lang)}
                      {service.note ? (
                        <span className="t-label ml-2 text-muted">{service.note[lang]}</span>
                      ) : null}
                    </span>
                    <span className="text-[14px] leading-[1.6] font-light whitespace-nowrap text-muted">
                      {formatPrice(service.price)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
