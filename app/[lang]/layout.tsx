import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { isLocale, locales } from "@/lib/i18n";
import { homeMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import "../globals.css";

// Self-hosted rather than the CDN link the prototype uses. Hoisted to module
// level so the font is resolved once per build, not per render.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

// Both locales are prerendered. Anything else that isn't a language 404s through
// the isLocale checks below and in each page, not through `dynamicParams = false`:
// that setting would close every route under [lang] to new params, and an offer
// created after a deploy would 404 on its own page until the next build.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  return {
    ...(await homeMetadata(lang)),
    alternates: {
      canonical: `/${lang}/`,
      languages: { es: "/es/", en: "/en/" },
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html lang={lang} className={`${cormorant.variable} ${dmSans.variable}`}>
      {/* Bottom padding lets the footer scroll clear of the fixed WhatsApp bar (mobile) and box (desktop). */}
      <body className="pb-[76px] nav:pb-28">{children}</body>
    </html>
  );
}
