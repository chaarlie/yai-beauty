import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import { otherLocale } from "@/lib/i18n";
import { Wordmark } from "./site-header";

/**
 * The proposal's quiet footer. Links are absolute, so they work from an offer's
 * own page as well as from home; the studio's details live in the contact band.
 */
export function SiteFooter({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const home = `/${lang}/`;

  return (
    <footer className="section-x py-7">
      <div className="flex flex-wrap items-center justify-between gap-5 text-[12px] leading-[1.6] text-muted">
        <Wordmark href={`${home}#top`} />
        <span>{dict.footer.tagline}</span>
        <div className="flex flex-wrap gap-x-5.5 gap-y-2">
          <a href={`${home}#tratamientos`}>{dict.nav.services}</a>
          <a href={`${home}#precios`}>{dict.nav.prices}</a>
          <a href={`${home}#contacto`}>{dict.nav.contact}</a>
          <a href={`/${otherLocale[lang]}/`} hrefLang={otherLocale[lang]} lang={otherLocale[lang]}>
            {dict.footer.otherLanguage}
          </a>
        </div>
      </div>
    </footer>
  );
}
