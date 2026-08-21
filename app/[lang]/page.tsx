import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import {
  getBusiness,
  getFeaturedServices,
  getPromo,
  getRemainingByCategory,
  getServices,
  serviceName,
} from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { PromoCard } from "@/components/promo-card";
import { ServiceList } from "@/components/service-list";
import { ResultsGallery } from "@/components/results-gallery";
import { About } from "@/components/about";
import { FaqList } from "@/components/faq-list";
import { BookingForm } from "@/components/booking-form";
import { SiteFooter } from "@/components/site-footer";
import { MobileBookBar } from "@/components/mobile-book-bar";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const services = getServices();
  const featured = getFeaturedServices();
  const groups = getRemainingByCategory();
  const promo = getPromo();
  const business = getBusiness();

  // No real photography exists yet, so every slot is a labelled placeholder.
  // Drop an entry to remove a cell; the gallery is omitted entirely at zero.
  const results = dict.results.photos.map((label) => ({ label }));

  return (
    <>
      <SiteHeader lang={lang} dict={dict} />

      <main>
        <Hero dict={dict} treatmentCount={services.length} />

        {promo ? <PromoCard promo={promo} lang={lang} dict={dict} /> : null}

        <ServiceList featured={featured} groups={groups} lang={lang} dict={dict} />

        {results.length > 0 ? <ResultsGallery items={results} dict={dict} /> : null}

        <About dict={dict} />

        <section className="section-x grid gap-12 border-t border-rule py-16 lg:grid-cols-2 lg:gap-18 lg:py-22">
          <FaqList items={dict.faq.items} dict={dict} />
          <BookingForm
            copy={dict.form}
            whatsapp={business.whatsapp}
            options={services.map((service) => ({
              slug: service.slug,
              name: serviceName(service, lang),
            }))}
          />
        </section>
      </main>

      <SiteFooter business={business} dict={dict} />
      <MobileBookBar label={dict.nav.book} prefill={dict.hero.prefill} />
    </>
  );
}
