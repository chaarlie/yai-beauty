#!/usr/bin/env node
/**
 * Prints the link Yasmin opens to create her /admin account — or, once it exists,
 * to choose a new password. There's no "forgot password" email; this is it.
 *
 *   npm run admin:invite                 link for the live site
 *   npm run admin:invite -- --local      link for http://localhost:3000
 *   npm run admin:invite -- --secret     prints a new ADMIN_SESSION_SECRET instead
 *
 * Reads ADMIN_EMAIL, ADMIN_SESSION_SECRET and the Sanity settings from .env.local.
 * The secret must be the one the target site runs with — Vercel's, for a live
 * link — or the link won't verify. A link works once and expires in 7 days; an
 * older unused link stays valid until either one is used.
 *
 * Mirrors createToken("setup", …) in lib/admin/session-token.ts.
 */
import { createHmac, randomBytes } from "node:crypto";

const LIVE_SITE = "https://yai-beauty.vercel.app";
const MAX_AGE_S = 7 * 24 * 60 * 60;

if (process.argv.includes("--secret")) {
  console.log(`ADMIN_SESSION_SECRET=${randomBytes(48).toString("base64url")}`);
  process.exit(0);
}

const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const secret = process.env.ADMIN_SESSION_SECRET ?? "";
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_ADMIN_DATASET || "admin";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!email || secret.length < 32 || !projectId || !token) {
  console.error("Set ADMIN_EMAIL, ADMIN_SESSION_SECRET (32+ chars), NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local.");
  process.exit(1);
}

// The link has to carry the account's current password stamp: "" before it exists.
const query = encodeURIComponent('*[_id == "adminAccount"][0].passwordStamp');
const res = await fetch(`https://${projectId}.api.sanity.io/v2026-10-22/data/query/${dataset}?query=${query}`, {
  headers: { Authorization: `Bearer ${token}` },
});
if (!res.ok) {
  console.error(`Couldn't read the account from Sanity (${res.status}).`);
  process.exit(1);
}
const stamp = (await res.json()).result ?? "";

const body = Buffer.from(JSON.stringify({ e: email, s: stamp, exp: Math.floor(Date.now() / 1000) + MAX_AGE_S })).toString("base64url");
const signature = createHmac("sha256", `setup.${secret}`).update(body).digest("base64url");
const base = process.argv.includes("--local") ? "http://localhost:3000" : (process.env.SITE_URL ?? LIVE_SITE);

console.log(`\n${stamp ? "New-password" : "Account-creation"} link for ${email} (valid 7 days, works once):\n`);
console.log(`${base}/admin/setup/?t=${body}.${signature}\n`);
