import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/session";
import { listOffers } from "@/lib/admin/offers";
import { currentOfferId, formatDay, offerStatus, todayInSosua, type Offer } from "@/lib/offers";
import AdminFrame from "./AdminFrame";

export const dynamic = "force-dynamic";

type Badge = { label: string; tone: string };

const BADGES = {
  shown: { label: "En la página", tone: "bg-clay text-white" },
  waiting: { label: "En espera", tone: "bg-blush-300 text-ink" },
  scheduled: { label: "Programada", tone: "bg-blush-300 text-ink" },
  ended: { label: "Terminada", tone: "bg-blush-50 text-muted" },
  off: { label: "Oculta", tone: "bg-blush-50 text-muted" },
} satisfies Record<string, Badge>;

function badge(offer: Offer, today: string, shownId: string | null): Badge {
  const status = offerStatus(offer, today);
  if (status === "live") return offer.id === shownId ? BADGES.shown : BADGES.waiting;
  return BADGES[status];
}

function dates(offer: Offer): string {
  if (offer.startsOn && offer.endsOn) return `Del ${formatDay(offer.startsOn, "es")} al ${formatDay(offer.endsOn, "es")}`;
  if (offer.endsOn) return `Hasta el ${formatDay(offer.endsOn, "es")}`;
  if (offer.startsOn) return `Desde el ${formatDay(offer.startsOn, "es")}`;
  return "Sin fecha de fin";
}

const NOTICES: Record<string, string> = {
  saved: "Oferta guardada.",
  deleted: "Oferta eliminada.",
};

/**
 * Every offer and where it stands. The site shows one at a time — the live one
 * with the latest start — so a second live offer reads "En espera" until the
 * first ends or is hidden.
 */
export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login/");
  const { done } = await searchParams;
  const notice = typeof done === "string" ? NOTICES[done] : undefined;

  let offers: Offer[] = [];
  let loadError = false;
  try {
    offers = await listOffers();
  } catch (error) {
    console.error("[admin] listOffers", error);
    loadError = true;
  }
  const today = todayInSosua();
  const shownId = currentOfferId(offers, today);

  return (
    <AdminFrame email={session.email} section="offers">
      <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-[40px] leading-[1.1] font-light">Ofertas</h1>
        <Link href="/admin/offers/new/" className="t-button inline-flex min-h-11 items-center bg-ink px-6 text-cream hover:bg-[#0f0c0b] hover:text-cream">
          Nueva oferta
        </Link>
      </div>

      {notice ? (
        <p role="status" className="mt-6 bg-blush-50 px-4 py-3 text-[15px] text-secondary">
          {notice}
        </p>
      ) : null}

      {loadError ? (
        <p role="alert" className="mt-6 bg-blush-50 px-4 py-3 text-[15px] text-[#8a3b2e]">
          No se pudieron cargar las ofertas desde Sanity. Inténtalo de nuevo en un momento.
        </p>
      ) : offers.length === 0 ? (
        <p className="mt-6 text-[16px] font-light text-secondary">Todavía no hay ofertas. Crea la primera.</p>
      ) : (
        <ul className="mt-8 border-t border-rule">
          {offers.map((offer) => {
            const { label, tone } = badge(offer, today, shownId);
            return (
              <li key={offer.id} className="border-b border-rule">
                <Link
                  href={`/admin/offers/${offer.id}/`}
                  className="flex flex-col gap-2 py-5 hover:text-inherit sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                >
                  <span>
                    <span className="block text-[17px] leading-[1.5]">{offer.title.es}</span>
                    <span className="t-label mt-1 block text-muted">{dates(offer)}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-4 self-start">
                    <span className={`t-label px-2.5 py-1 ${tone}`}>{label}</span>
                    <span className="t-button-sm border-b border-ink px-1 py-1">Editar</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AdminFrame>
  );
}
