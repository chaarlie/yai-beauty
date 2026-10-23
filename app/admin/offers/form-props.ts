import "server-only";
import { PRICE_PREFIX } from "@/lib/content";
import { listAdminServices } from "@/lib/admin/services";
import { getDictionary } from "@/lib/dictionaries";
import { todayInSosua } from "@/lib/offers";
import type { PreviewCopy } from "./OfferForm";

/**
 * Everything the editor needs from the server besides the offer itself. The
 * preview copy comes from the site's own dictionaries, so the folder in the
 * editor says exactly what the public one will.
 */
export async function offerFormProps() {
  const [es, en, services] = await Promise.all([getDictionary("es"), getDictionary("en"), listAdminServices()]);
  const copy = (dict: typeof es): PreviewCopy => ({
    cover: dict.nav.offers,
    validUntil: dict.promo.validUntil,
    value: dict.promo.value,
    open: dict.promo.folder.open,
    close: dict.promo.folder.close,
  });

  return {
    // Fresh from Sanity, hidden ones marked: an offer can still give one away.
    services: services.map((service) => ({
      slug: service.slug,
      name: service.active ? service.name.es : `${service.name.es} (oculto)`,
    })),
    pricePrefix: PRICE_PREFIX,
    today: todayInSosua(),
    copy: { es: copy(es), en: copy(en) },
  };
}
