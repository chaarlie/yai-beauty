import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { failure, invalid, isAdmin, readJson, unauthorized } from "@/lib/admin/api";
import { createOffer, listOffers } from "@/lib/admin/offers";
import { listAdminServices } from "@/lib/admin/services";
import { OFFERS_TAG, parseOfferInput } from "@/lib/offers";

/** Every offer, newest first — live, scheduled, ended and switched off. */
export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  try {
    return NextResponse.json({ offers: await listOffers() });
  } catch (error) {
    return failure(error);
  }
}

/**
 * Creates an offer from a full `OfferInput` (see lib/offers.ts). Answers 201
 * with the stored offer, or 400 with per-field `issues`.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();

  const body = await readJson(request);
  if (body instanceof Response) return body;

  try {
    // Checked against the stored catalog, so a service added a minute ago counts.
    const parsed = parseOfferInput(body, (await listAdminServices()).map((service) => service.slug));
    if (!parsed.ok) return invalid(parsed.issues);

    const offer = await createOffer(parsed.value);
    // Expire now rather than serve stale once: Yasmin opens the site to check.
    revalidateTag(OFFERS_TAG, { expire: 0 });
    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    return failure(error);
  }
}
