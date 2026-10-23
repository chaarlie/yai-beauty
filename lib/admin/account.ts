import "server-only";
import { randomBytes } from "node:crypto";
import { getAccountClient } from "@/lib/sanity";

/**
 * Yasmin's /admin account: a single document in the private `admin` dataset.
 * She creates it herself from an invite link (see app/admin/setup), so nobody
 * else ever knows her password — only its scrypt hash is stored.
 */

export type AdminAccount = {
  email: string;
  passwordHash: string;
  /** Random, replaced on every password change; sessions and invite links carry it. */
  passwordStamp: string;
  rev: string;
};

const ACCOUNT_ID = "adminAccount";

export async function getAccount(): Promise<AdminAccount | null> {
  const doc = await getAccountClient().fetch<{
    email: string;
    passwordHash: string;
    passwordStamp: string;
    _rev: string;
  } | null>(`*[_id == $id][0]{email, passwordHash, passwordStamp, _rev}`, { id: ACCOUNT_ID }, { cache: "no-store" });
  return doc ? { email: doc.email, passwordHash: doc.passwordHash, passwordStamp: doc.passwordStamp, rev: doc._rev } : null;
}

/**
 * Creates the account, or replaces the password of the one read as `current`,
 * and returns the new stamp. Replacing the stamp spends the invite link that led
 * here and signs every other session out. Both writes fail on a race rather than
 * clobber: `create` refuses an id that exists, and the patch only applies at
 * `current.rev`.
 */
export async function savePassword(email: string, passwordHash: string, current: AdminAccount | null): Promise<string> {
  const client = getAccountClient();
  const passwordStamp = randomBytes(16).toString("base64url");
  const passwordChangedAt = new Date().toISOString();

  if (!current) {
    await client.create({ _id: ACCOUNT_ID, _type: "adminAccount", email, passwordHash, passwordStamp, passwordChangedAt });
  } else {
    await client
      .patch(ACCOUNT_ID)
      .ifRevisionId(current.rev)
      .set({ email, passwordHash, passwordStamp, passwordChangedAt })
      .commit();
  }
  return passwordStamp;
}
