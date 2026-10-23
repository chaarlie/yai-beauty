import { redirect } from "next/navigation";
import { isDocumentId } from "@/lib/admin/api";
import { getOffer } from "@/lib/admin/offers";
import { getAdminSession } from "@/lib/admin/session";
import AdminFrame from "../../AdminFrame";
import OfferForm from "../OfferForm";
import { offerFormProps } from "../form-props";

export const dynamic = "force-dynamic";

export default async function EditOfferPage({ params }: PageProps<"/admin/offers/[id]">) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login/");

  const { id } = await params;
  const offer = isDocumentId(id) ? await getOffer(id) : null;
  // Deleted in another tab, or a mistyped link: back to the list rather than a dead end.
  if (!offer) redirect("/admin/");

  return (
    <AdminFrame email={session.email} section="offers">
      <OfferForm offer={offer} {...await offerFormProps()} />
    </AdminFrame>
  );
}
