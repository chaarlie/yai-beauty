import type { Business } from "@/lib/content";
import type { Dictionary } from "@/lib/dictionaries";
import { imageUrl } from "@/lib/content";
import { BookingForm, type BookingOption } from "./booking-form";
import { PhotoSlot } from "./photo-slot";

type Props = {
  business: Business;
  dict: Dictionary;
  /** Treatments for the form's list, already in the page's language. */
  options: BookingOption[];
};

/** The proposal's dark band: the booking form, and where to find the studio — its balcony over the beach, then the address. */
export function Contact({ business, dict, options }: Props) {
  const { address } = business;

  return (
    <section id="contacto" className="section-x bg-ink py-14 text-cream lg:py-18">
      <div className="grid gap-11 lg:grid-cols-[1.25fr_1fr] lg:gap-18">
        <div>
          <p className="t-eyebrow text-cream">{dict.nav.contact}</p>
          <h2 className="mt-4 mb-3.5 font-display text-[length:clamp(40px,4vw,54px)] leading-[1.08] font-light">
            {dict.form.heading}
          </h2>
          <p className="max-w-[440px] text-[14px] leading-[1.65] text-on-dark-body">{dict.form.intro}</p>
          <BookingForm copy={dict.form} whatsapp={business.whatsapp} options={options} />
        </div>

        <div className="border-t border-rule-dark pt-6.5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12.5">
          <PhotoSlot
            label={dict.footer.placePhoto}
            src={imageUrl("salon-areas/spa-21.webp")}
            parallax={false}
            focus="50% 50%"
            className="aspect-4/5 w-full max-w-[360px]"
          />
          <address className="mt-7 text-[14px] leading-[1.8] text-on-dark-body not-italic">
            <strong className="mb-2.5 block text-[16px] font-medium text-white">{business.name}</strong>
            <p className="mb-4">
              {address.building}
              <br />
              {address.street}, {address.city}
              <br />
              {dict.footer.country}
            </p>
            <p className="mb-4">{dict.footer.appointments}</p>
            <ul className="flex flex-col items-start gap-1.5">
              <li>
                <a href={`tel:${business.phone}`} className="border-b border-on-dark-caption hover:text-white">
                  {business.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${business.email}`} className="border-b border-on-dark-caption hover:text-white">
                  {business.email}
                </a>
              </li>
              <li>
                <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex gap-2.5 border-b border-on-dark-caption hover:text-white">
                  {dict.footer.instagramLabel} {business.instagram}
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            </ul>
          </address>
        </div>
      </div>
    </section>
  );
}
