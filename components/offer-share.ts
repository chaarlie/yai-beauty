import "server-only";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { Promo } from "@/lib/content";
import { offerPath } from "@/lib/offers";
import { siteUrl } from "@/lib/site";

/**
 * What <ShareOffer> needs for one offer. The link is the offer's own page on the
 * public site — never localhost, which nobody else can open — so its preview
 * shows that offer rather than the home page.
 */
export function offerShare(promo: Promo, lang: Locale, dict: Dictionary) {
  const path = offerPath(lang, promo.id);
  const { label, whatsapp, facebook, instagram, copy, copied, instagramSaved, instagramHint, failed } = dict.promo.share;
  return {
    url: new URL(path, siteUrl()).href,
    text: dict.promo.share.text.replace("{offer}", promo.title[lang]),
    storyImagePath: `${path}historia/`,
    fileName: `oferta-yai-beauty-${promo.id.slice(0, 8)}.png`,
    labels: { label, whatsapp, facebook, instagram, copy, copied, instagramSaved, instagramHint, failed },
  };
}
