import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import { otherLocale } from "@/lib/i18n";
import { LangToggle } from "./lang-toggle";
import { MobileNav } from "./mobile-nav";
import { PrimaryNav } from "./primary-nav";
import { ScrollProgress } from "./scroll-progress";
import { WhatsAppCTA } from "./whatsapp-cta";

import { navItems } from "@/lib/navigation";
export type { NavItem } from "@/lib/navigation";

/** `href` defaults to the top of the page it's on; the offer pages point it home. */
export function Wordmark({ href = "#top" }: { href?: string }) {
  return (
    <a href={href} className="flex shrink-0 items-baseline gap-2 whitespace-nowrap hover:text-inherit lg:gap-3">
      <span className="font-display text-[18px] leading-none font-normal tracking-[0.18em] lg:text-[22px]">
        YAI BEAUTY
      </span>
      <span className="text-[10px] leading-none tracking-[0.42em] text-muted lg:text-[11px]">
        ESTHETIC
      </span>
    </a>
  );
}

export function SiteHeader({ lang, dict, hasPromo, hasResults }: { lang: Locale; dict: Dictionary; hasPromo: boolean; hasResults: boolean }) {
  const items = navItems(dict.nav, { hasPromo, hasResults });

  return (
    <header
      id="top"
      className="sticky top-0 z-40 border-b border-rule bg-cream/95 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-6 px-6 py-4 lg:px-14 lg:py-[26px]">
        <Wordmark />

        <PrimaryNav items={items} label={dict.nav.mainNav} />

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

      <ScrollProgress />
    </header>
  );
}
