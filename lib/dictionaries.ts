import type { Locale } from "./i18n";
import type es from "../dictionaries/es.json";

/** The Spanish dictionary is the source of truth for the shape. */
export type Dictionary = typeof es;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  es: () => import("../dictionaries/es.json").then((m) => m.default),
  en: () => import("../dictionaries/en.json").then((m) => m.default),
};

export function getDictionary(lang: Locale): Promise<Dictionary> {
  return dictionaries[lang]();
}
