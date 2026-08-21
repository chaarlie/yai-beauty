export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

/** Spanish is primary; English is the toggle. */
export const defaultLocale: Locale = "es";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const otherLocale: Record<Locale, Locale> = {
  es: "en",
  en: "es",
};
