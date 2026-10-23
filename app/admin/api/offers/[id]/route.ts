import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { failure, invalid, isAdmin, isDocumentId, notFound, readJson, unauthorized } from "@/lib/admin/api";
import { deleteOffer, getOffer, updateOffer } from "@/lib/admin/offers";
import { listAdminServices } from "@/lib/admin/services";
import { OFFERS_TAG, parseOfferInput } from "@/lib/offers";

type Context = RouteContext<"/admin/api/offers/[id]">;

/**
 * Changes part of an offer. Top-level fields sent replace the stored ones whole
 * (send all of `title`, not just `title.en`); the merged result is validated as
 * a complete offer, so dates are checked against each other.
 */
export async function PATCH(request: Request, ctx: Context) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await ctx.params;
  if (!isDocumentId(id)) return notFound();

  const body = await readJson(request);
  if (body instanceof Response) return body;
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return invalid({ _: "Se esperaba un objeto JSON" });
  }

  try {
    const existing = await getOffer(id);
    if (!existing) return notFound();

    const parsed = parseOfferInput({ ...existing, ...body }, (await listAdminServices()).map((service) => service.slug));
    if (!parsed.ok) return invalid(parsed.issues);

    const offer = await updateOffer(id, parsed.value);
    if (!offer) return notFound();
    revalidateTag(OFFERS_TAG, { expire: 0 });
    return NextResponse.json({ offer });
  } catch (error) {
    return failure(error);
  }
}

/** Removes an offer for good. To take one off the site but keep it, PATCH `active: false`. */
export async function DELETE(_request: Request, ctx: Context) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await ctx.params;
  if (!isDocumentId(id)) return notFound();

  try {
    if (!(await deleteOffer(id))) return notFound();
    revalidateTag(OFFERS_TAG, { expire: 0 });
    return NextResponse.json({ deleted: id });
  } catch (error) {
    return failure(error);
  }
}
