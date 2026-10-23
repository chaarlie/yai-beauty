import "server-only";
import { createClient, type SanityClient } from "@sanity/client";

/**
 * Sanity clients, server-side only. Same split as henriks-apartments: a reader
 * for the public pages and an editor for /admin, whose token can write — so this
 * module must never reach the browser ("server-only" makes that a build error).
 *
 * Both skip Sanity's CDN. Reads happen at build and on revalidation, not per
 * visit, and right after /admin saves an offer the CDN can still hold the old
 * one; the page would then cache that until the next revalidation.
 */

const apiVersion = "2026-10-22";

function config() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
  return {
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion,
    useCdn: false,
    perspective: "published" as const,
  };
}

let reader: SanityClient | null = null;
let editor: SanityClient | null = null;

/** Published content only. The token is optional — a public dataset needs none. */
export function getReadClient(): SanityClient {
  reader ??= createClient({ ...config(), token: process.env.SANITY_API_READ_TOKEN });
  return reader;
}

/** For /admin route handlers that have already checked the session. */
export function getWriteClient(): SanityClient {
  editor ??= createClient({ ...config(), token: writeToken() });
  return editor;
}

let accounts: SanityClient | null = null;

/**
 * The PRIVATE dataset holding Yasmin's /admin account. `production` is public —
 * anyone can query it — so a password hash can never live there.
 */
export function getAccountClient(): SanityClient {
  accounts ??= createClient({
    ...config(),
    dataset: process.env.SANITY_ADMIN_DATASET || "admin",
    token: writeToken(),
  });
  return accounts;
}

function writeToken(): string {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) throw new Error("Missing SANITY_API_WRITE_TOKEN");
  return token;
}
