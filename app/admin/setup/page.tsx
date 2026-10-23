import type { Metadata } from "next";
import Link from "next/link";
import { getAccount } from "@/lib/admin/account";
import { verifyToken } from "@/lib/admin/session-token";
import SetupForm from "./SetupForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tu cuenta · Yai Beauty admin",
  // The link carries a one-time token; keep it out of Referer headers.
  referrer: "no-referrer",
};

/**
 * Where an invite link lands (scripts/admin-invite.mjs makes them). Before the
 * account exists it creates it; after, it sets a new password — the same link
 * format does both, and each link works once.
 */
export default async function SetupPage({ searchParams }: PageProps<"/admin/setup">) {
  const { t } = await searchParams;
  const token = typeof t === "string" ? t : "";
  const claim = verifyToken("setup", token);

  let account = null;
  let unreachable = false;
  if (claim) {
    try {
      account = await getAccount();
    } catch (error) {
      console.error("[admin] setup getAccount", error);
      unreachable = true;
    }
  }
  const usable = claim !== null && !unreachable && (account?.passwordStamp ?? "") === claim.stamp;

  return (
    <main className="grid min-h-dvh place-items-center bg-blush-50 px-4 py-10">
      {usable ? (
        <SetupForm token={token} email={claim.email} creating={account === null} />
      ) : (
        <div className="w-full max-w-[400px] bg-cream p-7 sm:p-9">
          <p className="t-eyebrow">Yai Beauty · Admin</p>
          <h1 className="mt-4 font-display text-[32px] leading-[1.1] font-light">
            {unreachable ? "No se pudo conectar" : "Este enlace ya no sirve"}
          </h1>
          <p className="mt-3 text-[15px] leading-[1.6] font-light text-secondary">
            {unreachable
              ? "Inténtalo de nuevo en un momento."
              : "Caducó o ya se usó. Pide un enlace nuevo, o entra si ya tienes tu contraseña."}
          </p>
          <Link href="/admin/login/" className="t-button-sm mt-6 inline-block border-b border-ink px-1 py-2 hover:border-clay">
            Ir a entrar
          </Link>
        </div>
      )}
    </main>
  );
}
