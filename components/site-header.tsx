import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import { otherLocale } from "@/lib/i18n";
import { LangToggle } from "./lang-toggle";
import { MobileNav } from "./mobile-nav";
import { WhatsAppCTA } from "./whatsapp-cta";

export type NavItem = { href: string; label: string };

/** "Servicios" and "Precios" both point at the treatments list — it is one flat
 *  priced list, which is the client's explicit choice. */
export function navItems(dict: Dictionary): NavItem[] {
  return [
    { href: "#tratamientos", label: dict.nav.services },
    { href: "#ofertas", label: dict.nav.offers },
    { href: "#tratamientos", label: dict.nav.prices },
    { href: "#resultados", label: dict.nav.results },
    { href: "#sobre", label: dict.nav.about },
    { href: "#contacto", label: dict.nav.contact },
  ];
}

function Wordmark() {
  return (
    <a href="#top" className="flex shrink-0 items-baseline gap-2 whitespace-nowrap hover:text-inherit lg:gap-3">
      <span className="font-display text-[18px] leading-none font-normal tracking-[0.18em] lg:text-[22px]">
        YAI BEAUTY
      </span>
      <span className="text-[10px] leading-none tracking-[0.42em] text-muted lg:text-[11px]">
        ESTHETIC
      </span>
    </a>
  );
}

export function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const items = navItems(dict);

  return (
    <header
      id="top"
      className="sticky top-0 z-40 border-b border-rule bg-cream/95 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-6 px-6 py-4 lg:px-14 lg:py-[26px]">
        <Wordmark />

        <nav aria-label={dict.nav.mainNav} className="hidden nav:flex nav:gap-[34px]">
          {items.map((item, i) => (
            <a key={`${item.href}-${i}`} className="t-nav text-secondary" href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 lg:gap-5">
          {/* Both of these stay visible in the collapsed bar — they are the two
              things that convert. */}
          <LangToggle
            lang={lang}
            href={`/${otherLocale[lang]}/`}
            label={dict.nav.toggleLang}
          />
          <span className="hidden sm:inline-flex">
            <WhatsAppCTA label={dict.nav.book} variant="solid" />
          </span>
          <MobileNav items={items} openLabel={dict.nav.openMenu} closeLabel={dict.nav.closeMenu} />
        </div>
      </div>
    </header>
  );
}
