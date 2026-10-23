import { offerImage } from "@/components/offer-image";

/** The 1080×1920 story picture the Instagram share button hands to the phone. */
export async function GET(_request: Request, ctx: RouteContext<"/[lang]/ofertas/[id]/historia">) {
  const { lang, id } = await ctx.params;
  return offerImage(lang, id, "story");
}
