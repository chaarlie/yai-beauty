import type { Metadata } from "next";
import Link from "next/link";
import { defaultLocale, locales } from "@/lib/i18n";
import { homeMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return {
    // Link previews never run the script below, so the bare address carries the
    // Spanish home page's card itself. The card still opens `/`, so whoever taps
    // it lands in their own language.
    ...(await homeMetadata(defaultLocale, "/")),
    // The two real locales are what gets indexed; this is only a doorway.
    robots: { index: false, follow: false },
    alternates: {
      languages: { es: "/es/", en: "/en/", "x-default": `/${defaultLocale}/` },
    },
  };
}

// Built when the site was a static export, so the locale choice for the bare `/` is made
// in the browser: a remembered choice first, then the browser's own language,
// then Spanish. Inlined rather than run from a client component so the redirect
// fires before React is downloaded — this page is a doorway, not a render.
const REDIRECT = `(function(){var s=${JSON.stringify(locales)},l=null;
try{l=localStorage.getItem("yai.lang.v1")}catch(e){}
if(s.indexOf(l)<0){var p=(navigator.languages&&navigator.languages[0])||navigator.language||"";
l=p.toLowerCase().indexOf("es")===0?"es":"en"}
location.replace("/"+l+"/")})()`;

export default function LocaleDoorway() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: REDIRECT }} />
      <noscript>
        <p style={{ fontFamily: "sans-serif", padding: 24 }}>
          <Link href="/es/">Yai Beauty Esthetic — Español</Link> · <Link href="/en/">English</Link>
        </p>
      </noscript>
    </>
  );
}
