"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { otherLocale } from "@/lib/i18n";

const STORAGE_KEY = "yai.lang.v1";

type Props = {
  lang: Locale;
  href: string;
  label: string;
};

/**
 * Both languages are real, indexable, shareable routes — the toggle is a link,
 * not state. The only client-side concern is remembering the choice so the bare
 * `/` lands returning visitors on the right locale.
 */
export function LangToggle({ lang, href, label }: Props) {
  const target = otherLocale[lang];

  return (
    <Link
      href={href}
      hrefLang={target}
      aria-label={label}
      onClick={() => {
        try {
          localStorage.setItem(STORAGE_KEY, target);
        } catch {
          // Private mode or storage disabled — the toggle still navigates.
        }
      }}
      className="t-button-sm inline-flex min-h-11 items-center gap-1 border border-rule-button px-3 whitespace-nowrap hover:border-clay hover:text-ink"
    >
      <span className={lang === "es" ? "text-ink" : "text-muted"}>ES</span>
      <span className="text-muted">/</span>
      <span className={lang === "en" ? "text-ink" : "text-muted"}>EN</span>
    </Link>
  );
}
