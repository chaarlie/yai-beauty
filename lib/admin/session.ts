import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { getAccount } from "@/lib/admin/account";
import { SESSION_COOKIE, verifyToken } from "@/lib/admin/session-token";

export interface AdminIdentity {
  email: string;
}

/**
 * The signed-in admin, or null. A valid cookie isn't enough on its own: its
 * stamp must still match the account's, so a password change ends every older
 * session. proxy.ts only checks the signature — this is the real gate, and every
 * page, action and route handler goes through it. Cached per request.
 */
export const getAdminSession = cache(async (): Promise<AdminIdentity | null> => {
  const claim = verifyToken("session", (await cookies()).get(SESSION_COOKIE)?.value);
  if (!claim) return null;

  const account = await getAccount().catch((error) => {
    console.error("[admin] getAccount", error);
    return null;
  });
  if (!account || account.email !== claim.email || account.passwordStamp !== claim.stamp) return null;
  return { email: account.email };
});
