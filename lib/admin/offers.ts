import "server-only";
import { getWriteClient } from "@/lib/sanity";
import {
  OFFER_PROJECTION,
  OFFER_TYPE,
  docToOffer,
  emptyFields,
  offerToFields,
  type Offer,
  type OfferDoc,
  type OfferInput,
} from "@/lib/offers";

/**
 * /admin's reads and writes on `offer` documents. Never cached: the admin always
 * sees what is stored. Callers check the session first and revalidate OFFERS_TAG
 * after a write so the public pages pick the change up.
 *
 * Writes go straight to published documents, as in henriks-apartments — there is
 * no draft step for Yasmin to forget.
 */

const NO_CACHE = { cache: "no-store" } as const;

export async function listOffers(): Promise<Offer[]> {
  const docs = await getWriteClient().fetch<OfferDoc[]>(
    `*[_type == $type] | order(_createdAt desc) ${OFFER_PROJECTION}`,
    { type: OFFER_TYPE },
    NO_CACHE,
  );
  return docs.map(docToOffer);
}

export async function getOffer(id: string): Promise<Offer | null> {
  const doc = await getWriteClient().fetch<OfferDoc | null>(
    `*[_type == $type && _id == $id][0] ${OFFER_PROJECTION}`,
    { type: OFFER_TYPE, id },
    NO_CACHE,
  );
  return doc ? docToOffer(doc) : null;
}

export async function createOffer(input: OfferInput): Promise<Offer> {
  const created = await getWriteClient().create({
    _id: crypto.randomUUID(),
    _type: OFFER_TYPE,
    ...offerToFields(input),
  });
  // Read back through the projection so every caller gets the same shape.
  const offer = await getOffer(created._id);
  if (!offer) throw new Error(`Offer ${created._id} was created but can't be read back`);
  return offer;
}

export async function updateOffer(id: string, input: OfferInput): Promise<Offer | null> {
  await getWriteClient().patch(id).set(offerToFields(input)).unset(emptyFields(input)).commit();
  return getOffer(id);
}

/** True when a document was deleted, false when there was none with that id. */
export async function deleteOffer(id: string): Promise<boolean> {
  if (!(await getOffer(id))) return false;
  await getWriteClient().delete(id);
  return true;
}
