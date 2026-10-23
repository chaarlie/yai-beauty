/**
 * The single content read boundary.
 *
 * Yasmin's editable content — services with their prices, and offers — comes
 * from Sanity, which /admin writes to. `services.json` keeps what she doesn't
 * edit: categories, business details and the before/after pairs. Nothing
 * outside this file should import the JSON directly, and nothing outside this
 * file should know where content lives.
 */
import { cache } from "react";
import data from "./services.json";
import type { Locale } from "./i18n";
import { OFFERS_TAG, OFFER_PROJECTION, OFFER_TYPE, isOfferId, todayInSosua, type Localized, type OfferDoc } from "./offers";
import { SERVICE_PROJECTION, SERVICE_TYPE, SERVICES_TAG, type CategoryId, type ServiceDoc } from "./services";
import { getReadClient } from "./sanity";

export type { CategoryId };

export type Service = {
  slug: string;
  category: CategoryId;
  /** Plain functional name. Always what the booking form and WhatsApp use. */
  es: string;
  en: string;
  /** Catalog headline from the printed price list, where one exists. */
  display?: { es: string; en: string };
  price: number;
  note?: { es: string; en: string };
  /** Carries a photo row in the catalog. */
  featured?: boolean;
  /**
   * Full photo URL once read through `getServices()` (the data stores a bucket
   * path); falls back to a labelled placeholder when absent.
   */
  image?: string;
  imageFocus?: string;
  imageParallax?: boolean;
};

export type ResultPair = {
  service: Service;
  before: string;
  after: string;
  /** "stacked" puts before above after; "split" sets them side by side. */
  layout: "stacked" | "split";
  /** CSS object-position, shared by both halves so they crop alike. */
  focus: string;
};

type ResultEntry = {
  service: string;
  layout: ResultPair["layout"];
  focus: string;
  /** Date the client signed written permission; null until she has. */
  consent: string | null;
};

/**
 * Photography is served from the public Supabase Storage bucket `yai-beauty`,
 * not /public. Content stores paths inside the bucket; this is the one place
 * that knows where the bucket is.
 */
const IMAGE_BASE = "https://jdomxbzbovlnnlxoqngs.supabase.co/storage/v1/object/public/yai-beauty";

export function imageUrl(path: string): string {
  return `${IMAGE_BASE}/${path}`;
}

export type Category = {
  id: CategoryId;
  es: string;
  en: string;
};

/** A live offer, with every text resolved for both locales. */
export type Promo = {
  id: string;
  label: Record<Locale, string>;
  heading: Record<Locale, string>;
  badge: Record<Locale, string>;
  title: Record<Locale, string>;
  body: Record<Locale, string>;
  steps: Record<Locale, string>[];
  /** Short words stuck on the folder's coupon; the value sticker is added from `valueDOP`. */
  stickers: Record<Locale, string>[];
  valueDOP: number | null;
  /** Last day it runs (YYYY-MM-DD), or null when it has no end date. */
  endsOn: string | null;
};

export type Business = {
  name: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  email: string;
  instagram: string;
  instagramUrl: string;
  address: {
    street: string;
    building: string;
    city: string;
    country: string;
  };
  yearsExperience: number;
  appointmentOnly: boolean;
  freeEvaluation: boolean;
};

function toService(doc: ServiceDoc): Service {
  const both = (text: Localized) => ({ es: text.es, en: text.en || text.es });
  return {
    slug: doc.slug,
    category: doc.category,
    es: doc.name.es,
    en: doc.name.en || doc.name.es,
    ...(doc.display ? { display: both(doc.display) } : {}),
    price: doc.price,
    ...(doc.note ? { note: both(doc.note) } : {}),
    featured: doc.featured === true,
    ...(doc.image ? { image: imageUrl(doc.image) } : {}),
    ...(doc.imageFocus ? { imageFocus: doc.imageFocus } : {}),
    ...(doc.imageParallax !== null ? { imageParallax: doc.imageParallax } : {}),
  };
}

/**
 * Every service in Sanity, hidden ones included, in catalog order. Cached for the
 * render; tagged so an /admin save refreshes the pages at once, and refreshed
 * hourly besides.
 *
 * Unlike offers, a failure here throws rather than degrading: a page without its
 * price list is worse than no new page. At build that fails loudly; during a
 * background refresh Next keeps serving the last good page.
 */
const getCatalog = cache(async (): Promise<{ service: Service; active: boolean }[]> => {
  const docs = await getReadClient().fetch<ServiceDoc[]>(
    /* groq */ `*[_type == $type] | order(order asc) ${SERVICE_PROJECTION}`,
    { type: SERVICE_TYPE },
    { next: { revalidate: 3600, tags: [SERVICES_TAG] } },
  );
  if (docs.length === 0) throw new Error("No services in Sanity — refusing to render an empty price list");
  return docs.map((doc) => ({ service: toService(doc), active: doc.active !== false }));
});

/** The services on offer: hidden ones are left out of the price list and the booking form. */
export async function getServices(): Promise<Service[]> {
  return (await getCatalog()).filter((entry) => entry.active).map((entry) => entry.service);
}

/** The treatments that get a photo row. Order follows the data. */
export async function getFeaturedServices(): Promise<Service[]> {
  return (await getServices()).filter((service) => service.featured === true);
}

/**
 * Everything not featured above, grouped in the catalog's own order. Categories
 * with nothing left in them are dropped rather than rendering an empty heading.
 */
export async function getRemainingByCategory(): Promise<{ category: Category; services: Service[] }[]> {
  const byCategory = new Map<CategoryId, Service[]>();
  for (const service of await getServices()) {
    if (service.featured === true) continue;
    const bucket = byCategory.get(service.category);
    if (bucket) bucket.push(service);
    else byCategory.set(service.category, [service]);
  }

  return getCategories()
    .map((category) => ({ category, services: byCategory.get(category.id) ?? [] }))
    .filter((group) => group.services.length > 0);
}

/** The four catalog categories, in the printed catalog's order. */
export function getCategories(): Category[] {
  return data.categories as Category[];
}

/** English falls back to the Spanish wherever Yasmin left it blank. */
function localize(text: Localized): Record<Locale, string> {
  return { es: text.es, en: text.en || text.es };
}

function toPromo(doc: OfferDoc): Promo {
  return {
    id: doc._id,
    label: localize(doc.label),
    heading: localize(doc.heading),
    badge: localize(doc.badge),
    title: localize(doc.title),
    body: localize(doc.body),
    steps: (doc.steps ?? []).map(localize),
    stickers: (doc.stickers ?? []).map(localize),
    valueDOP: doc.valueDOP,
    endsOn: doc.endsOn,
  };
}

/** Switched on, started, not yet ended — on Sosúa's calendar. */
const LIVE = /* groq */ `_type == $type && active != false
  && (!defined(startsOn) || startsOn <= $today)
  && (!defined(endsOn) || endsOn >= $today)`;

const OFFER_FETCH = { next: { revalidate: 3600, tags: [OFFERS_TAG] } };

/**
 * Every live offer from Sanity, newest first, or none to hide the promo
 * sections. "Newest" is the latest start date, undated offers after dated ones —
 * the order currentOfferId in lib/offers.ts mirrors. Yai edits offers in /admin,
 * which revalidates OFFERS_TAG; the hourly refresh is for the calendar, so an
 * offer drops off within the hour after its last day.
 *
 * Missing configuration or an outage hides the offers rather than failing the build.
 */
export async function getPromos(): Promise<Promo[]> {
  try {
    const docs = await getReadClient().fetch<OfferDoc[]>(
      `*[${LIVE}] | order(coalesce(startsOn, "") desc, _createdAt desc) ${OFFER_PROJECTION}`,
      { type: OFFER_TYPE, today: todayInSosua() },
      OFFER_FETCH,
    );
    return docs.map(toPromo);
  } catch (error) {
    console.error("[getPromos]", error);
    return [];
  }
}

/** One live offer, for its own page and share images; null once it's hidden, over or gone. */
export async function getPromoById(id: string): Promise<Promo | null> {
  if (!isOfferId(id)) return null;
  try {
    const doc = await getReadClient().fetch<OfferDoc | null>(
      `*[${LIVE} && _id == $id][0] ${OFFER_PROJECTION}`,
      { type: OFFER_TYPE, today: todayInSosua(), id },
      OFFER_FETCH,
    );
    return doc ? toPromo(doc) : null;
  } catch (error) {
    console.error("[getPromoById]", error);
    return null;
  }
}

export function getBusiness(): Business {
  return data.business as Business;
}

/**
 * Before/after pairs in display order. Showing one without the client's written
 * consent is legal exposure, so production builds drop any pair that has no
 * `consent` date; `next dev` keeps them so the layout can be reviewed while the
 * signatures are still pending.
 *
 * Pairs look their service up among all of them, hidden included, so hiding a
 * treatment from the price list never breaks its before/after.
 */
export async function getResults(): Promise<ResultPair[]> {
  const services = (await getCatalog()).map((entry) => entry.service);
  return (data.results as ResultEntry[])
    .filter((entry) => entry.consent || process.env.NODE_ENV === "development")
    .map((entry) => {
      const service = services.find((s) => s.slug === entry.service);
      if (!service) throw new Error(`results: no service with slug "${entry.service}"`);
      const dir = `treatments/${entry.service}`;
      return {
        service,
        before: imageUrl(`${dir}/before.webp`),
        after: imageUrl(`${dir}/after.webp`),
        layout: entry.layout,
        focus: entry.focus,
      };
    });
}

/** Plain name — booking form options and the WhatsApp message Yai receives. */
export function serviceName(service: Service, lang: Locale): string {
  return service[lang];
}

/** Catalog headline where one exists, otherwise the plain name. */
export function serviceDisplayName(service: Service, lang: Locale): string {
  return service.display?.[lang] ?? service[lang];
}

/**
 * Prices change — always read them from the content layer, never hardcode one
 * in a component. Grouping separators are the same in es-DO and en-US.
 */
export function formatPrice(amount: number): string {
  return `${PRICE_PREFIX}${amount.toLocaleString("en-US")}`;
}

/** "RD$". Exported for the admin's live preview, a client component that can't import this module. */
export const PRICE_PREFIX: string = data.priceDisplay;
