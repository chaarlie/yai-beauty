import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * Password hashing for the /admin account, stored as
 * `scrypt:<N>:<r>:<p>:<salt>:<hash>` (salt and hash base64url) — the format
 * henriks-apartments uses. Here the hash is made by the setup page when Yasmin
 * picks her password, and kept in the private `admin` Sanity dataset.
 */

const N = 2 ** 15;
const R = 8;
const P = 1;
const KEYLEN = 64;
const MAX_MEM = 64 * 1024 * 1024;

/** Shortest password the setup page accepts. A few words work well. */
export const MIN_PASSWORD_LENGTH = 10;

function derive(password: string, salt: Buffer, keylen: number, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password, salt, keylen, { N: n, r, p, maxmem: MAX_MEM }, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await derive(password, salt, KEYLEN, N, R, P);
  return `scrypt:${N}:${R}:${P}:${salt.toString("base64url")}:${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, salt, hash] = parts;
  const params = [Number(n), Number(r), Number(p)];
  if (!params.every(Number.isInteger)) return false;

  const expected = Buffer.from(hash, "base64url");
  if (expected.length < 32) return false;
  try {
    const actual = await derive(password, Buffer.from(salt, "base64url"), expected.length, params[0], params[1], params[2]);
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
