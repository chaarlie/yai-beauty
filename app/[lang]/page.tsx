import { siteUrl } from "@/lib/site";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import {
  getBusiness,
  getCategories,
  getFeaturedServices,
  getPromos,
  getResults,
  getServices,
  getServicesByCategory,
  serviceName,
} from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { PromoCard } from "@/components/promo-card";
import { ServiceList } from "@/components/service-list";
import { ResultsGallery } from "@/components/results-gallery";
import { About } from "@/components/about";
import { FirstVisit } from "@/components/first-visit";
import { FaqList } from "@/components/faq-list";
import { Contact } from "@/components/contact";
import { SiteFooter } from "@/components/site-footer";
import { MobileBookBar } from "@/components/mobile-book-bar";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const [services, featured, groups, promos, pairs] = await Promise.all([
    getServices(),
    getFeaturedServices(),
    getServicesByCategory(),
    getPromos(),
    getResults(),
  ]);
  const business = getBusiness();

  // Only pairs with signed consent reach a production build (see getResults);
  // the gallery is omitted entirely at zero.
  const results = pairs.map(({ service, ...pair }) => ({
    ...pair,
    label: serviceName(service, lang),
  }));

  return (
    <>
      <SiteHeader lang={lang} dict={dict} hasPromo={promos.length > 0} hasResults={results.length > 0} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BeautySalon",
        "@id": new URL("/#salon", siteUrl()).href,
        name: business.name,
        url: new URL(`/${lang}/`, siteUrl()).href,
        telephone: business.phone,
        email: business.email,
        sameAs: [business.instagramUrl],
        address: {
          "@type": "PostalAddress",
          streetAddress: `${business.address.street}, ${business.address.building}`,
          addressLocality: business.address.city,
          addressCountry: "DO",
        },
      }).replace(/</g, "\\u003c") }} />
      <main>
        {/* The offers live in the hero now, in place of its photo. */}
        <Hero dict={dict} lang={lang} treatmentCount={services.length} promos={promos} />

        {/* Sections follow the nav's left-to-right order (Servicios, Precios,
            Ofertas, …) so the header underline steps through the menu in
            sequence as you scroll. */}
        <ServiceList featured={featured} groups={groups} categories={getCategories()} lang={lang} dict={dict} />

        {promos.length > 0 ? (
          <section id="ofertas" aria-label={dict.nav.offers} className="section-x grid scroll-mt-28 gap-4 pb-6 lg:pb-10">
            {promos.map((promo) => (
              <PromoCard key={promo.id} promo={promo} lang={lang} dict={dict} />
            ))}
          </section>
        ) : null}

        {results.length > 0 ? <ResultsGallery items={results} dict={dict} /> : null}

        <About dict={dict} />
        <FirstVisit dict={dict} />
        <FaqList dict={dict} />
        <Contact
          business={business}
          dict={dict}
          options={services.map((service) => ({ slug: service.slug, name: serviceName(service, lang) }))}
        />
      </main>

      <SiteFooter lang={lang} dict={dict} />
      <MobileBookBar label={dict.nav.bookLong} prefill={dict.hero.prefill} />
    </>
  );
}
