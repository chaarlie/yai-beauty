import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed /admin tokens: `<base64url payload>.<base64url HMAC-SHA256>`.
 *
 * Two purposes share the format, each signed with its own key derived from
 * ADMIN_SESSION_SECRET, so a token minted for one never passes as the other:
 *
 *   "session" — the sign-in cookie. Carries the account's passwordStamp, a random
 *               value every password change replaces, signing older sessions out.
 *   "setup"   — the invite link Yasmin opens to create her account or set a new
 *               password. Carries the stamp it was minted against ("" before the
 *               account exists), so it works once: using it replaces the stamp.
 *
 * The stamp is random rather than a counter so nothing old can line up again: a
 * counter would restart if the account were ever deleted and recreated, and
 * revive every reset link minted against its early values.
 *
 * No "server-only" import on purpose — proxy.ts uses this (Proxy runs on the
 * Node.js runtime). scripts/admin-invite.mjs mints "setup" tokens the same way.
 */

export const SESSION_COOKIE = "yai_admin_session";
export const SESSION_MAX_AGE_S = 7 * 24 * 60 * 60;
export const SETUP_MAX_AGE_S = 7 * 24 * 60 * 60;

type Purpose = "session" | "setup";

export type AdminClaim = { email: string; stamp: string };

interface Payload {
  /** email, lowercased */
  e: string;
  /** the account's passwordStamp ("" before the account exists) */
  s: string;
  /** expiry, unix seconds */
  exp: number;
}

/** The one address allowed into /admin, lowercased; null when ADMIN_EMAIL is unset. */
export function adminEmail(): string | null {
  return (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase() || null;
}

function signingKey(purpose: Purpose): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  return secret.length >= 32 ? `${purpose}.${secret}` : null;
}

const sign = (data: string, key: string) => createHmac("sha256", key).update(data).digest("base64url");

export function createToken(purpose: Purpose, claim: AdminClaim, maxAgeS: number): string {
  const key = signingKey(purpose);
  if (!key) throw new Error("Admin login is not configured");
  const payload: Payload = { e: claim.email, s: claim.stamp, exp: Math.floor(Date.now() / 1000) + maxAgeS };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body, key)}`;
}

/**
 * The claim when the token is authentic, unexpired and for ADMIN_EMAIL; otherwise
 * null. Whether the stamp is still current is the caller's check — it needs the
 * account, which this module doesn't read.
 */
export function verifyToken(purpose: Purpose, token: string | undefined): AdminClaim | null {
  const key = signingKey(purpose);
  const allowed = adminEmail();
  if (!key || !allowed || !token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = Buffer.from(sign(body, key));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Payload;
    if (typeof data.e !== "string" || typeof data.s !== "string" || typeof data.exp !== "number") return null;
    if (data.exp * 1000 <= Date.now()) return null;
    if (data.e !== allowed) return null;
    return { email: data.e, stamp: data.s };
  } catch {
    return null;
  }
}
