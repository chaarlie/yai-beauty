import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No longer a static export: /admin, its API routes and proxy.ts need a server.
  // The public pages are still prerendered, and refresh when an offer changes.

  // Kept from the static-export days so every address already shared — /es/,
  // /en/ — stays the canonical one.
  trailingSlash: true,

  images: {
    // Photos ship exactly as stored: they are already sized WebP, and Supabase's
    // image transformations aren't on the free plan.
    unoptimized: true,
    // Photography lives in the public `yai-beauty` bucket (see lib/content.ts).
    // `unoptimized` skips this check today; it keeps any optimizer scoped to
    // the bucket if that ever changes.
    remotePatterns: [
      new URL("https://jdomxbzbovlnnlxoqngs.supabase.co/storage/v1/object/public/yai-beauty/**"),
    ],
  },
};

export default nextConfig;
