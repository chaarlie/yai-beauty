import type { Metadata } from "next";
import { getBusiness } from "./content";
import { getDictionary } from "./dictionaries";
import type { Locale } from "./i18n";
import { siteUrl } from "./site";

// Ends in "/" like every address on the site (`trailingSlash`); without it,
// each preview bot meets a redirect before it reaches the picture.
const CARD_IMAGE = "/opengraph-image/";

/**
 * The home page's title, description and sharing card, in one language.
 *
 * The bare `/` doorway carries the Spanish one too: WhatsApp, Facebook and the
 * other link previews read these tags without running the doorway's script
 * that picks a language, so a link to the bare address showed no card at all.
 * `url` is the address the card opens.
 */
export async function homeMetadata(lang: Locale, url = `/${lang}/`): Promise<Metadata> {
  const dict = await getDictionary(lang);
  const business = getBusiness();

  return {
    metadataBase: siteUrl(),
    title: dict.meta.title,
    description: dict.meta.description,
    twitter: { card: "summary_large_image", images: [CARD_IMAGE] },
    openGraph: {
      type: "website",
      url,
      images: [{ url: CARD_IMAGE, width: 1200, height: 630, alt: business.name }],
      siteName: business.name,
      locale: lang === "es" ? "es_DO" : "en_US",
      title: dict.meta.title,
      description: dict.meta.description,
    },
  };
}
