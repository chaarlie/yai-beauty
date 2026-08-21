import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static site — nothing needs a server at launch. See handoff "Recommended stack".
  // Phase 2 (Sanity -> Instagram) requires a server; this is the line that goes away.
  output: "export",

  // Emit /es/index.html rather than /es.html so any static host serves it correctly.
  trailingSlash: true,

  images: {
    // `output: 'export'` has no image optimization server. Swap in a custom
    // `loader`/`loaderFile` if real photography ever moves to a CDN.
    unoptimized: true,
  },
};

export default nextConfig;
