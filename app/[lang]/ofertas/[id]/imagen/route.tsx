import { offerImage } from "@/components/offer-image";

/** The 1200×630 picture an offer's link preview shows on Facebook and WhatsApp. */
export async function GET(_request: Request, ctx: RouteContext<"/[lang]/ofertas/[id]/imagen">) {
  const { lang, id } = await ctx.params;
  return offerImage(lang, id, "card");
}
