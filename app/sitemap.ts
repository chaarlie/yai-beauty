import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { locales } from "@/lib/i18n";
import { getPromos } from "@/lib/content";
import { offerPath } from "@/lib/offers";

/** The two home pages, plus each live offer's own page in both languages. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const page = (path: (lang: (typeof locales)[number]) => string) => {
    const languages = Object.fromEntries(locales.map((lang) => [lang, new URL(path(lang), siteUrl()).href]));
    return locales.map((lang) => ({ url: languages[lang], alternates: { languages } }));
  };

  const promos = await getPromos();
  return [page((lang) => `/${lang}/`), ...promos.map((promo) => page((lang) => offerPath(lang, promo.id)))].flat();
}
