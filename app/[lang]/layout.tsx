import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { getDictionary } from "@/lib/dictionaries";
import { getBusiness } from "@/lib/content";
import { isLocale, locales } from "@/lib/i18n";
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

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

// Both locales are prerendered; `output: 'export'` requires the full set.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const dict = await getDictionary(lang);
  const business = getBusiness();

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `/${lang}/`,
      languages: { es: "/es/", en: "/en/" },
    },
    openGraph: {
      type: "website",
      siteName: business.name,
      locale: lang === "es" ? "es_DO" : "en_US",
      title: dict.meta.title,
      description: dict.meta.description,
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html lang={lang} className={`${cormorant.variable} ${jost.variable}`}>
      {/* Bottom padding clears the fixed mobile WhatsApp bar. */}
      <body className="pb-[76px] nav:pb-0">{children}</body>
    </html>
  );
}
