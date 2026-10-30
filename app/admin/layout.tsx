import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "../globals.css";

/*
  A ROOT layout, not a nested one — the public site's root layout lives under
  app/[lang] so <html lang> carries the real language. /admin is a static
  segment, so it matches here rather than being read as a language, and it
  renders <html> and <body> itself. Spanish only: it's for Yasmin.
*/

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yai Beauty — Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="min-h-dvh bg-cream text-ink">{children}</body>
    </html>
  );
}
