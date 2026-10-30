import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { getBusiness, getPromoById, getPromos, getServices, serviceName } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { offerPath } from "@/lib/offers";
import { Contact } from "@/components/contact";
import { MobileBookBar } from "@/components/mobile-book-bar";
import { PromoCard } from "@/components/promo-card";
import { PromoTeaser } from "@/components/promo-teaser";
import { SiteFooter } from "@/components/site-footer";
import { Wordmark } from "@/components/site-header";
import { WhatsAppCTA } from "@/components/whatsapp-cta";

/**
 * One offer on a page of its own — the link the share buttons send. It exists so
 * Facebook and WhatsApp build the preview from THIS offer's title, text and
 * picture rather than the home page's.
 *
 * The offers live at build time are prerendered; one created later renders on
 * its first visit and is cached from then on, refreshed with the others when
 * /admin saves.
 */
export async function generateStaticParams() {
  return (await getPromos()).map((promo) => ({ id: promo.id }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/ofertas/[id]">): Promise<Metadata> {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const promo = await getPromoById(id);
  if (!promo) return { robots: { index: false } };

  const business = getBusiness();
  const path = offerPath(lang, id);
  const image = { url: `${path}imagen/`, width: 1200, height: 630, alt: promo.title[lang] };
  return {
    title: `${promo.title[lang]} · ${business.name}`,
    description: promo.body[lang],
    alternates: { canonical: path, languages: { es: offerPath("es", id), en: offerPath("en", id) } },
    openGraph: {
      type: "website",
      url: path,
      siteName: business.name,
      locale: lang === "es" ? "es_DO" : "en_US",
      title: promo.title[lang],
      description: promo.body[lang],
      images: [image],
    },
    twitter: { card: "summary_large_image", images: [image.url] },
  };
}

export default async function OfferPage({ params }: PageProps<"/[lang]/ofertas/[id]">) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();

  const promo = await getPromoById(id);
  // Over, hidden or deleted: a link someone shared still lands on the offers.
  if (!promo) redirect(`/${lang}/#ofertas`);

  const [dict, services] = await Promise.all([getDictionary(lang), getServices()]);
  const business = getBusiness();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-rule bg-cream/95 backdrop-blur-sm">
        <div className="section-x flex items-center justify-between gap-6 py-3.5 lg:min-h-[86px]">
          <Wordmark href={`/${lang}/`} />
          <WhatsAppCTA label={dict.nav.book} variant="solid" arrow />
        </div>
      </header>

      <main>
        <section className="section-x py-10 lg:py-14">
          <div className="mx-auto max-w-[620px]">
            <PromoTeaser promos={[promo]} lang={lang} dict={dict} />
          </div>
        </section>
        <div className="section-x">
          <PromoCard promo={promo} lang={lang} dict={dict} />
        </div>
        <p className="section-x py-12 text-center">
          <a href={`/${lang}/`} className="t-button-sm inline-flex min-h-11 items-center gap-5 border-b border-ink hover:border-clay hover:text-inherit">
            {dict.promo.page.allOffers}
            <span aria-hidden="true">→</span>
          </a>
        </p>
        <Contact
          business={business}
          dict={dict}
          options={services.map((service) => ({ slug: service.slug, name: serviceName(service, lang) }))}
        />
      </main>

      <SiteFooter lang={lang} dict={dict} />
      <MobileBookBar label={dict.nav.bookLong} prefill={dict.promo.prefill.replace("{offer}", promo.title[lang])} />
    </>
  );
}
