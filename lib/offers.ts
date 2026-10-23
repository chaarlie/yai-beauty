/**
 * The offer model shared by the site and /admin: its shape, the validation every
 * write goes through, and the mapping to and from `offer` documents in Sanity.
 *
 * Pure functions only — no data access — so it is safe on either side of the
 * server/client boundary.
 */

/** Spanish is required; the English page falls back to it when `en` is absent. */
export type Localized = { es: string; en?: string };

export type OfferInput = {
  active: boolean;
  /** YYYY-MM-DD, inclusive, on Sosúa's calendar. Null means no start date. */
  startsOn: string | null;
  /** YYYY-MM-DD, inclusive. Null means it runs until switched off. */
  endsOn: string | null;
  /** Eyebrow above the offer, e.g. "Especial del mes". */
  label: Localized;
  /** The promo section's heading, e.g. "Oferta de referidos". */
  heading: Localized;
  /** The short line on the folder's coupon and the card's chip, e.g. "Facial gratis". */
  badge: Localized;
  title: Localized;
  body: Localized;
  steps: Localized[];
  /** Words stuck on the folder; the value sticker is added from `valueDOP`. */
  stickers: Localized[];
  /** Slug of the treatment the offer gives away, if any. */
  rewardService: string | null;
  valueDOP: number | null;
};

export type Offer = OfferInput & { id: string; createdAt: string; updatedAt: string };

/** How Sanity stores a localized text: a typed object, keyed when it sits in an array. */
type LocaleString = { _type: "localeString"; es: string; en?: string };
type LocaleItem = LocaleString & { _key: string };

/** The fields an `offer` document carries besides Sanity's own. Empty ones are left out. */
export type OfferFields = {
  active: boolean;
  startsOn?: string;
  endsOn?: string;
  label: LocaleString;
  heading: LocaleString;
  badge: LocaleString;
  title: LocaleString;
  body: LocaleString;
  steps: LocaleItem[];
  stickers: LocaleItem[];
  rewardService?: string;
  valueDOP?: number;
};

/** An `offer` document as OFFER_PROJECTION returns it: absent fields come back null. */
export type OfferDoc = {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  active: boolean | null;
  startsOn: string | null;
  endsOn: string | null;
  label: Localized;
  heading: Localized;
  badge: Localized;
  title: Localized;
  body: Localized;
  steps: Localized[] | null;
  stickers: Localized[] | null;
  rewardService: string | null;
  valueDOP: number | null;
};

export const OFFER_TYPE = "offer";

/** Every field an Offer needs — the projection both the site and /admin query with. */
export const OFFER_PROJECTION = /* groq */ `{
  _id, _createdAt, _updatedAt, active, startsOn, endsOn,
  label, heading, badge, title, body, steps, stickers, rewardService, valueDOP
}`;

/** Cache tag on every read of offers; writes revalidate it. */
export const OFFERS_TAG = "offers";

/** Offer ids are UUIDs minted on create; anything else can't be one. */
export function isOfferId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/** Each offer's own page — what gets shared, so its preview shows that offer. */
export function offerPath(lang: "es" | "en", id: string): string {
  return `/${lang}/ofertas/${id}/`;
}

/**
 * Upper bounds, set by what the layout can hold rather than taste: the badge has
 * to sit on one line of the folder's coupon on a 320px phone, and a sticker has
 * to fit its spot. The folder has three sticker spots and the value takes one.
 */
export const OFFER_LIMITS = {
  label: 40,
  heading: 60,
  badge: 16,
  title: 120,
  body: 400,
  step: 120,
  steps: 5,
  sticker: 14,
  stickers: 2,
  valueDOP: 1_000_000,
} as const;

type Issues = Record<string, string>;
export type ParseResult = { ok: true; value: OfferInput } | { ok: false; issues: Issues };

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCalendarDate(value: string): boolean {
  if (!DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function text(raw: unknown, field: string, max: number, issues: Issues): Localized | undefined {
  if (!isRecord(raw)) {
    issues[field] = "Falta el texto en español";
    return undefined;
  }
  const es = typeof raw.es === "string" ? raw.es.trim() : "";
  const en = typeof raw.en === "string" ? raw.en.trim() : "";
  if (!es) issues[`${field}.es`] = "Falta el texto en español";
  else if (es.length > max) issues[`${field}.es`] = `Máximo ${max} caracteres`;
  if (en.length > max) issues[`${field}.en`] = `Máximo ${max} caracteres`;
  return en ? { es, en } : { es };
}

function list(raw: unknown, field: string, maxItems: number, maxChars: number, issues: Issues): Localized[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) {
    issues[field] = "Debe ser una lista";
    return [];
  }
  if (raw.length > maxItems) issues[field] = `Máximo ${maxItems}`;
  return raw.slice(0, maxItems).flatMap((item, i) => {
    const value = text(item, `${field}.${i}`, maxChars, issues);
    return value ? [value] : [];
  });
}

function date(raw: unknown, field: string, issues: Issues): string | null {
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw !== "string" || !isCalendarDate(raw)) {
    issues[field] = "Fecha no válida (AAAA-MM-DD)";
    return null;
  }
  return raw;
}

/**
 * Validates a whole offer. Unknown keys are ignored; text is trimmed, and an
 * empty English string is dropped so the page falls back to the Spanish.
 */
export function parseOfferInput(raw: unknown, serviceSlugs: readonly string[]): ParseResult {
  if (!isRecord(raw)) return { ok: false, issues: { _: "Se esperaba un objeto JSON" } };
  const issues: Issues = {};

  if (raw.active !== undefined && typeof raw.active !== "boolean") issues.active = "Debe ser true o false";
  const startsOn = date(raw.startsOn, "startsOn", issues);
  const endsOn = date(raw.endsOn, "endsOn", issues);
  if (startsOn && endsOn && endsOn < startsOn) issues.endsOn = "Termina antes de empezar";

  const label = text(raw.label, "label", OFFER_LIMITS.label, issues);
  const heading = text(raw.heading, "heading", OFFER_LIMITS.heading, issues);
  const badge = text(raw.badge, "badge", OFFER_LIMITS.badge, issues);
  const title = text(raw.title, "title", OFFER_LIMITS.title, issues);
  const body = text(raw.body, "body", OFFER_LIMITS.body, issues);
  const steps = list(raw.steps, "steps", OFFER_LIMITS.steps, OFFER_LIMITS.step, issues);
  const stickers = list(raw.stickers, "stickers", OFFER_LIMITS.stickers, OFFER_LIMITS.sticker, issues);

  let rewardService: string | null = null;
  if (raw.rewardService !== undefined && raw.rewardService !== null && raw.rewardService !== "") {
    if (typeof raw.rewardService === "string" && serviceSlugs.includes(raw.rewardService)) {
      rewardService = raw.rewardService;
    } else {
      issues.rewardService = "Tratamiento desconocido";
    }
  }

  let valueDOP: number | null = null;
  if (raw.valueDOP !== undefined && raw.valueDOP !== null && raw.valueDOP !== "") {
    const n = raw.valueDOP;
    if (typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= OFFER_LIMITS.valueDOP) valueDOP = n;
    else issues.valueDOP = "Debe ser un número entero de pesos";
  }

  if (Object.keys(issues).length > 0 || !label || !heading || !badge || !title || !body) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    value: {
      // Validated above as boolean or absent; absent means a new offer goes live.
      active: raw.active !== false,
      startsOn,
      endsOn,
      label,
      heading,
      badge,
      title,
      body,
      steps,
      stickers,
      rewardService,
      valueDOP,
    },
  };
}

/** Sanity hands back `_type`/`_key` alongside the text; the app only wants the text. */
function plain(text: Localized): Localized {
  return text.en ? { es: text.es, en: text.en } : { es: text.es };
}

export function docToOffer(doc: OfferDoc): Offer {
  return {
    id: doc._id,
    createdAt: doc._createdAt,
    updatedAt: doc._updatedAt,
    active: doc.active !== false,
    startsOn: doc.startsOn,
    endsOn: doc.endsOn,
    label: plain(doc.label),
    heading: plain(doc.heading),
    badge: plain(doc.badge),
    title: plain(doc.title),
    body: plain(doc.body),
    steps: (doc.steps ?? []).map(plain),
    stickers: (doc.stickers ?? []).map(plain),
    rewardService: doc.rewardService,
    valueDOP: doc.valueDOP,
  };
}

function localeString(text: Localized): LocaleString {
  return { _type: "localeString", ...text };
}

/**
 * The document fields for a validated offer. Array items get fresh `_key`s —
 * Sanity requires one on every object in an array, and nothing here keeps a
 * reference to an item between saves.
 */
export function offerToFields(offer: OfferInput): OfferFields {
  const items = (list: Localized[]): LocaleItem[] =>
    list.map((text) => ({ ...localeString(text), _key: crypto.randomUUID().replace(/-/g, "").slice(0, 12) }));

  return {
    active: offer.active,
    ...(offer.startsOn ? { startsOn: offer.startsOn } : {}),
    ...(offer.endsOn ? { endsOn: offer.endsOn } : {}),
    label: localeString(offer.label),
    heading: localeString(offer.heading),
    badge: localeString(offer.badge),
    title: localeString(offer.title),
    body: localeString(offer.body),
    steps: items(offer.steps),
    stickers: items(offer.stickers),
    ...(offer.rewardService ? { rewardService: offer.rewardService } : {}),
    ...(offer.valueDOP !== null ? { valueDOP: offer.valueDOP } : {}),
  };
}

/** The optional fields a save leaves empty — a PATCH unsets them rather than writing null. */
export function emptyFields(offer: OfferInput): (keyof OfferFields)[] {
  const empty: (keyof OfferFields)[] = [];
  if (!offer.startsOn) empty.push("startsOn");
  if (!offer.endsOn) empty.push("endsOn");
  if (!offer.rewardService) empty.push("rewardService");
  if (offer.valueDOP === null) empty.push("valueDOP");
  return empty;
}

/** A YYYY-MM-DD date as "31 de diciembre" / "December 31" — no year, it has to fit the folder. */
export function formatDay(isoDate: string, lang: "es" | "en"): string {
  return new Intl.DateTimeFormat(lang === "es" ? "es-DO" : "en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

/** Today in Sosúa as YYYY-MM-DD: offers start and end on Yai's calendar, not UTC's. */
export function todayInSosua(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santo_Domingo" }).format(now);
}

export type OfferStatus = "live" | "scheduled" | "ended" | "off";

/** Where an offer stands today. The site shows the newest "live" one. */
export function offerStatus(offer: Pick<OfferInput, "active" | "startsOn" | "endsOn">, today: string): OfferStatus {
  if (!offer.active) return "off";
  if (offer.startsOn && offer.startsOn > today) return "scheduled";
  if (offer.endsOn && offer.endsOn < today) return "ended";
  return "live";
}

/**
 * Which of these offers the site shows today — the same pick getPromo's query
 * makes: live ones, latest start date first (undated last), then newest. Keep the
 * two in step.
 */
export function currentOfferId(offers: Offer[], today: string): string | null {
  const live = offers.filter((offer) => offerStatus(offer, today) === "live");
  live.sort((a, b) => (b.startsOn ?? "").localeCompare(a.startsOn ?? "") || b.createdAt.localeCompare(a.createdAt));
  return live[0]?.id ?? null;
}
