import "server-only";
import { ImageResponse } from "next/og";
import { getDictionary } from "@/lib/dictionaries";
import { formatPrice, getBusiness, getPromoById } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { formatDay } from "@/lib/offers";
import { siteUrl } from "@/lib/site";

const INK = "#1a1614";
const CREAM = "#fbf3ee";
const CLAY = "#b98a80";
const CAPTION = "#8a6a5c";
const SECONDARY = "#4a3f39";

/** "card" is the 1200×630 link preview; "story" is 1080×1920, for Instagram. */
export type OfferImageFormat = "card" | "story";

const SIZES = { card: { width: 1200, height: 630 }, story: { width: 1080, height: 1920 } };

/**
 * The picture that travels with a shared offer, drawn in the site's colours.
 * Facebook and WhatsApp show the card in their link preview (the offer page
 * names it in its Open Graph tags); the story is what the Instagram button hands
 * to the phone's share sheet.
 *
 * Satori draws it: flexbox only, and every element with more than one child
 * needs `display: flex`. Cached at the CDN for an hour, so an edit to the offer
 * shows here within that.
 */
export async function offerImage(lang: string, id: string, format: OfferImageFormat): Promise<Response> {
  const promo = isLocale(lang) ? await getPromoById(id) : null;
  if (!isLocale(lang) || !promo) return new Response("Not found", { status: 404 });

  const dict = await getDictionary(lang);
  const business = getBusiness();
  const value = promo.valueDOP === null ? null : `${dict.promo.value} ${formatPrice(promo.valueDOP)}`;
  const validity = promo.endsOn ? dict.promo.validUntil.replace("{date}", formatDay(promo.endsOn, lang)) : null;
  const story = format === "story";
  const footnotes = [value, validity].filter((line): line is string => Boolean(line));

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        background: CREAM,
        color: INK,
        padding: story ? "120px 96px" : "64px 72px",
        borderBottom: `${story ? 40 : 24}px solid ${CLAY}`,
      }}
    >
      {/* Wraps, so a long label (up to 40 characters) drops a line instead of running into the name. */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "12px 40px", fontSize: story ? 30 : 24, letterSpacing: 6, color: CAPTION }}>
        <div>{promo.label[lang].toUpperCase()}</div>
        <div>YAI BEAUTY · ESTHETIC</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex" }}>
          <div style={{ background: CLAY, color: "#ffffff", fontSize: story ? 40 : 26, letterSpacing: 4, padding: story ? "18px 30px" : "12px 22px" }}>
            {promo.badge[lang].toUpperCase()}
          </div>
        </div>
        <div style={{ fontSize: story ? 96 : 62, lineHeight: 1.08, marginTop: story ? 48 : 28 }}>{promo.title[lang]}</div>
        {story ? (
          <div style={{ fontSize: 40, lineHeight: 1.45, marginTop: 44, color: SECONDARY }}>{promo.body[lang]}</div>
        ) : null}
        {footnotes.length > 0 ? (
          <div style={{ display: "flex", flexDirection: story ? "column" : "row", gap: story ? 16 : 40, marginTop: story ? 56 : 28, fontSize: story ? 40 : 28, color: SECONDARY }}>
            {footnotes.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: story ? "column" : "row", justifyContent: "space-between", gap: 12, fontSize: story ? 34 : 24, color: CAPTION }}>
        {/* One string, not JSX interpolation: "a {b} c" is several text nodes, which Satori refuses. */}
        <div>{`WhatsApp ${business.phoneDisplay} · ${business.address.city}`}</div>
        <div>{siteUrl().host}</div>
      </div>
    </div>,
    {
      ...SIZES[format],
      headers: { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" },
    },
  );
}
