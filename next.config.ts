import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  // Source service worker file (in src/app for App Router colocation)
  swSrc: "src/app/sw.ts",
  // Output location — must be in public/ so it can be served at /sw.js
  swDest: "public/sw.js",
  // Disable in dev to avoid stale caches interfering with hot reload
  disable: process.env.NODE_ENV === "development",
  // Automatically register the service worker
  register: true,
  // Exclude patterns from precache — do not precache auth or data endpoints
  exclude: [
    /\/api\//,          // No API routes in precache
    /\/admin\//,        // No admin pages in precache
    /\/login/,          // No login page in precache
  ],
});

const nextConfig: NextConfig = {
  turbopack: {},
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default withSerwist(nextConfig);
