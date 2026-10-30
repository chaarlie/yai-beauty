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
    <a href={href} className="flex shrink-0 flex-col items-center whitespace-nowrap hover:text-inherit">
      <span className="font-display text-[21px] leading-none font-normal tracking-[0.16em] lg:text-[25px]">
        YAI BEAUTY
      </span>
      {/* The negative margin takes back the tracking after the last letter, so it centres. */}
      <span className="mt-1.5 mr-[-0.4em] text-[8px] leading-none tracking-[0.4em] text-muted lg:text-[9px]">
        ESTHETIC · SOSÚA
      </span>
    </a>
  );
}

/** One quiet line above the header, as in the proposal; it scrolls away. */
function Announcement({ text }: { text: string }) {
  return (
    <p id="top" className="bg-blush-300 px-5 py-2 text-center text-[10px] leading-[1.5] tracking-[0.12em] text-secondary uppercase sm:text-[11px]">
      {text}
    </p>
  );
}

/** "Reservar" in a tight bar, "Reservar por WhatsApp" where there's room. */
function BookButtons({ short, long }: { short: string; long: string }) {
  return (
    <>
      <span className="hidden sm:inline-flex xl:hidden">
        <WhatsAppCTA label={short} variant="solid" arrow />
      </span>
      <span className="hidden xl:inline-flex">
        <WhatsAppCTA label={long} variant="solid" arrow />
      </span>
    </>
  );
}

export function SiteHeader({ lang, dict, hasPromo, hasResults }: { lang: Locale; dict: Dictionary; hasPromo: boolean; hasResults: boolean }) {
  const items = navItems(dict.nav, { hasPromo, hasResults });

  return (
    <>
      <Announcement text={dict.nav.announcement} />
      <header className="sticky top-0 z-40 border-b border-rule bg-cream/95 backdrop-blur-sm">
        <div className="section-x flex items-center justify-between gap-6 py-3.5 lg:min-h-[86px]">
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
            <BookButtons short={dict.nav.book} long={dict.nav.bookLong} />
            <MobileNav items={items} openLabel={dict.nav.openMenu} closeLabel={dict.nav.closeMenu} />
          </div>
        </div>

        <ScrollProgress />
      </header>
    </>
  );
}
