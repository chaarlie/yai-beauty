/**
 * The service catalog model shared by the site and /admin: the shape of a
 * `service` document in Sanity, the validation every save goes through, and the
 * slug rule for new services.
 *
 * Pure functions only — no data access — so it is safe on either side of the
 * server/client boundary.
 */
import type { Localized } from "./offers";

export const CATEGORY_IDS = ["facial", "corporal", "depilacion", "cejas-pestanas"] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export const SERVICE_TYPE = "service";

/** Cache tag on every read of the catalog; /admin saves revalidate it. */
export const SERVICES_TAG = "services";

export const SERVICE_LIMITS = { name: 60, display: 80, note: 120, benefit: 160, benefits: 6, price: 1_000_000, batch: 100 } as const;

/**
 * A `service` document as SERVICE_PROJECTION returns it: absent fields come back
 * null. `slug` is the stable key the before/after pairs, offers and booking
 * messages refer to — it never changes once created, even if the name does.
 */
export type ServiceDoc = {
  _id: string;
  _rev: string;
  slug: string;
  category: CategoryId;
  order: number;
  name: Localized;
  display: Localized | null;
  note: Localized | null;
  benefits: Localized[] | null;
  price: number;
  active: boolean | null;
  featured: boolean | null;
  image: string | null;
  imageFocus: string | null;
  imageParallax: boolean | null;
};

export const SERVICE_PROJECTION = /* groq */ `{
  _id, _rev, slug, category, order, name, display, note, benefits, price,
  active, featured, image, imageFocus, imageParallax
}`;

/** What /admin edits. Slug, photo, photo row and order stay as they are. */
export type ServiceInput = {
  category: CategoryId;
  /** Plain name — the booking form and WhatsApp use it. */
  name: Localized;
  /** The printed catalog's headline, where it differs from the plain name. */
  display: Localized | null;
  note: Localized | null;
  /** What the treatment does for the skin, one line each — shown beside its photo. */
  benefits: Localized[];
  price: number;
  /** False hides it from the price list and the booking form. */
  active: boolean;
};

export type AdminService = ServiceInput & {
  id: string;
  rev: string;
  slug: string;
  /** Gets a photo row on the page. Set in the data, not from /admin. */
  featured: boolean;
  order: number;
};

type Issues = Record<string, string>;
export type ServiceParse = { ok: true; value: ServiceInput } | { ok: false; issues: Issues };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function trimmed(raw: Record<string, unknown>, lang: "es" | "en"): string {
  return typeof raw[lang] === "string" ? (raw[lang] as string).trim() : "";
}

/** Spanish required, English optional; an empty English string is dropped. */
function requiredText(raw: unknown, field: string, max: number, issues: Issues): Localized | undefined {
  if (!isRecord(raw)) {
    issues[`${field}.es`] = "Falta el nombre en español";
    return undefined;
  }
  return optionalText(raw, field, max, issues, true) ?? undefined;
}

/** Null when both languages are blank; English without Spanish is an error. */
function optionalText(raw: unknown, field: string, max: number, issues: Issues, required = false): Localized | null {
  if (raw === undefined || raw === null) {
    if (required) issues[`${field}.es`] = "Falta el nombre en español";
    return null;
  }
  if (!isRecord(raw)) {
    issues[field] = "Texto no válido";
    return null;
  }
  const es = trimmed(raw, "es");
  const en = trimmed(raw, "en");
  if (!es && !en && !required) return null;
  if (!es) issues[`${field}.es`] = required ? "Falta el nombre en español" : "Falta el texto en español";
  else if (es.length > max) issues[`${field}.es`] = `Máximo ${max} caracteres`;
  if (en.length > max) issues[`${field}.en`] = `Máximo ${max} caracteres`;
  return en ? { es, en } : { es };
}

/** A list of optional texts; blank items are dropped. */
function textList(raw: unknown, field: string, maxItems: number, maxChars: number, issues: Issues): Localized[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) {
    issues[field] = "Debe ser una lista";
    return [];
  }
  if (raw.length > maxItems) issues[field] = `Máximo ${maxItems}`;
  return raw.slice(0, maxItems).flatMap((item, i) => optionalText(item, `${field}.${i}`, maxChars, issues) ?? []);
}

/** Validates one service as /admin sends it. Unknown keys are ignored. */
export function parseServiceInput(raw: unknown): ServiceParse {
  if (!isRecord(raw)) return { ok: false, issues: { _: "Se esperaba un objeto JSON" } };
  const issues: Issues = {};

  const name = requiredText(raw.name, "name", SERVICE_LIMITS.name, issues);
  const display = optionalText(raw.display, "display", SERVICE_LIMITS.display, issues);
  const note = optionalText(raw.note, "note", SERVICE_LIMITS.note, issues);
  const benefits = textList(raw.benefits, "benefits", SERVICE_LIMITS.benefits, SERVICE_LIMITS.benefit, issues);

  const category = raw.category;
  if (typeof category !== "string" || !(CATEGORY_IDS as readonly string[]).includes(category)) {
    issues.category = "Categoría desconocida";
  }

  const price = raw.price;
  if (typeof price !== "number" || !Number.isInteger(price) || price < 0 || price > SERVICE_LIMITS.price) {
    issues.price = "Pon el precio en pesos, sin decimales";
  }

  if (raw.active !== undefined && typeof raw.active !== "boolean") issues.active = "Debe ser true o false";

  if (Object.keys(issues).length > 0 || !name) return { ok: false, issues };
  return {
    ok: true,
    value: {
      category: category as CategoryId,
      name,
      display,
      note,
      benefits,
      price: price as number,
      active: raw.active !== false,
    },
  };
}

/** "Depilación de cejas" → "depilacion-de-cejas". */
export function slugify(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/, "") || "servicio"
  );
}

/** The slug, or the slug with -2, -3… when it's taken. */
export function uniqueSlug(base: string, taken: ReadonlySet<string>): string {
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}

export function docToAdminService(doc: ServiceDoc): AdminService {
  const plain = (text: Localized): Localized => (text.en ? { es: text.es, en: text.en } : { es: text.es });
  return {
    id: doc._id,
    rev: doc._rev,
    slug: doc.slug,
    category: doc.category,
    order: doc.order,
    name: plain(doc.name),
    display: doc.display ? plain(doc.display) : null,
    note: doc.note ? plain(doc.note) : null,
    benefits: (doc.benefits ?? []).map(plain),
    price: doc.price,
    active: doc.active !== false,
    featured: doc.featured === true,
  };
}
