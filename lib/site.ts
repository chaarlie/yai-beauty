/** Override when the salon moves to a custom domain. Never infer from request headers. */
export function siteUrl(): URL {
  const url = new URL(process.env.SITE_URL || "https://yai-beauty.vercel.app");
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("SITE_URL must be an HTTP(S) URL");
  return new URL(url.origin);
}
