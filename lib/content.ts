/**
 * The single content read boundary.
 *
 * At launch this is `services.json` in-repo. Phase 2 swaps the body of these
 * functions for Sanity queries — nothing outside this file should import the
 * JSON directly, and nothing outside this file should know where content lives.
 */
import data from "./services.json";
import type { Locale } from "./i18n";

export type CategoryId = "facial" | "corporal" | "depilacion" | "cejas-pestanas";

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
  /** Path under /public; falls back to a labelled placeholder when absent. */
  image?: string;
};

export type Category = {
  id: CategoryId;
  es: string;
  en: string;
};

export type Promo = {
  active: boolean;
  label: Record<Locale, string>;
  title: Record<Locale, string>;
  body: Record<Locale, string>;
  steps: Record<Locale, string>[];
  rewardService: string;
  valueDOP: number;
  validThrough: string;
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

export function getServices(): Service[] {
  return data.services as Service[];
}

/** The treatments that get a photo row. Order follows the data. */
export function getFeaturedServices(): Service[] {
  return getServices().filter((service) => service.featured === true);
}

/**
 * Everything not featured above, grouped in the catalog's own order. Categories
 * with nothing left in them are dropped rather than rendering an empty heading.
 */
export function getRemainingByCategory(): { category: Category; services: Service[] }[] {
  const byCategory = new Map<CategoryId, Service[]>();
  for (const service of getServices()) {
    if (service.featured === true) continue;
    const bucket = byCategory.get(service.category);
    if (bucket) bucket.push(service);
    else byCategory.set(service.category, [service]);
  }

  return (data.categories as Category[])
    .map((category) => ({ category, services: byCategory.get(category.id) ?? [] }))
    .filter((group) => group.services.length > 0);
}

export function getPromo(): Promo | null {
  const promo = data.promo as Promo;
  // `active: false` hides the section entirely. Yai rotates this monthly and
  // must not need a developer to do it.
  return promo.active ? promo : null;
}

export function getBusiness(): Business {
  return data.business as Business;
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
  return `${data.priceDisplay}${amount.toLocaleString("en-US")}`;
}
