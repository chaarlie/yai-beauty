import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/session";
import AdminFrame from "../../AdminFrame";
import OfferForm from "../OfferForm";
import { offerFormProps } from "../form-props";

export const dynamic = "force-dynamic";

export default async function NewOfferPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login/");

  return (
    <AdminFrame email={session.email} section="offers">
      <OfferForm offer={null} {...await offerFormProps()} />
    </AdminFrame>
  );
}
