import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/session";
import { listAdminServices } from "@/lib/admin/services";
import { PRICE_PREFIX, getCategories } from "@/lib/content";
import type { AdminService } from "@/lib/services";
import AdminFrame from "../AdminFrame";
import ServicesEditor from "./ServicesEditor";

export const dynamic = "force-dynamic";

/** Names and prices of every service, edited in place and saved together. */
export default async function ServicesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login/");

  let services: AdminService[] | null = null;
  try {
    services = await listAdminServices();
  } catch (error) {
    console.error("[admin] listAdminServices", error);
  }

  return (
    <AdminFrame email={session.email} section="services">
      {services ? (
        <ServicesEditor initial={services} categories={getCategories()} pricePrefix={PRICE_PREFIX} />
      ) : (
        <p role="alert" className="mt-10 bg-blush-50 px-4 py-3 text-[15px] text-[#8a3b2e]">
          No se pudieron cargar los servicios desde Sanity. Inténtalo de nuevo en un momento.
        </p>
      )}
    </AdminFrame>
  );
}
