import "server-only";
import { randomUUID } from "node:crypto";
import { getWriteClient } from "@/lib/sanity";
import {
  SERVICE_PROJECTION,
  SERVICE_TYPE,
  docToAdminService,
  slugify,
  uniqueSlug,
  type AdminService,
  type ServiceDoc,
  type ServiceInput,
} from "@/lib/services";
import type { Localized } from "@/lib/offers";

/**
 * /admin's reads and writes on `service` documents. Never cached: the admin
 * always sees what is stored. Callers check the session first and revalidate
 * SERVICES_TAG after a save.
 */

export async function listAdminServices(): Promise<AdminService[]> {
  const docs = await getWriteClient().fetch<ServiceDoc[]>(
    `*[_type == $type] | order(order asc) ${SERVICE_PROJECTION}`,
    { type: SERVICE_TYPE },
    { cache: "no-store" },
  );
  return docs.map(docToAdminService);
}

/** One row of a save: an existing service (with the revision it was read at) or a new one. */
export type ServiceSave = { id: string; rev: string; input: ServiceInput } | { id?: undefined; input: ServiceInput };

const localeString = (text: Localized) => ({ _type: "localeString", ...text });

function fields(input: ServiceInput) {
  return {
    category: input.category,
    name: localeString(input.name),
    ...(input.display ? { display: localeString(input.display) } : {}),
    ...(input.note ? { note: localeString(input.note) } : {}),
    price: input.price,
    active: input.active,
  };
}

function emptied(input: ServiceInput): string[] {
  return [...(input.display ? [] : ["display"]), ...(input.note ? [] : ["note"])];
}

/**
 * Saves every row in one transaction — all of them land or none do. An edited row
 * only applies at the revision it was read at, so a change made meanwhile in
 * another tab makes the whole save fail (409) instead of being overwritten.
 *
 * New services get a slug from their Spanish name, which then never changes, and
 * go to the end of the catalog. They start without a photo row.
 */
export async function saveServices(rows: ServiceSave[]): Promise<AdminService[]> {
  const client = getWriteClient();
  const existing = await listAdminServices();
  const taken = new Set(existing.map((service) => service.slug));
  let order = Math.max(0, ...existing.map((service) => service.order));

  const transaction = client.transaction();
  for (const row of rows) {
    if (row.id) {
      transaction.patch(client.patch(row.id).ifRevisionId(row.rev).set(fields(row.input)).unset(emptied(row.input)));
    } else {
      const slug = uniqueSlug(slugify(row.input.name.es), taken);
      taken.add(slug);
      order += 10;
      transaction.create({ _id: randomUUID(), _type: SERVICE_TYPE, slug, order, featured: false, ...fields(row.input) });
    }
  }
  await transaction.commit();
  return listAdminServices();
}
