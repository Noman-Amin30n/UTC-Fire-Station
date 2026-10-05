/**
 * UTC Emergency Dispatch — Serwist Service Worker
 *
 * Cache strategy:
 * - Precache: JS chunks, CSS, static assets, offline page (via __SW_MANIFEST)
 * - Images: CacheFirst (1 week) — company images from Cloudinary
 * - Static assets: StaleWhileRevalidate (1 day)
 * - Google Fonts: CacheFirst (1 year) — standard best practice
 * - Navigation: NetworkFirst with offline fallback to /~offline
 *
 * Security:
 * - Auth endpoints (/api/auth/*, /login, session) are NOT cached
 * - /api/offline/snapshot is NOT SW-cached (data goes to IndexedDB)
 * - /api/companies/search is NOT SW-cached (handled by IndexedDB offline)
 * - Admin routes (/admin/**) are NOT cached
 *
 * Data:
 * - Company data is stored in IndexedDB via Dexie (not SW cache)
 * - SW cache is for application shell only
 */
import { defaultCache } from "@serwist/next/worker";
import { Serwist, NetworkFirst, CacheFirst, StaleWhileRevalidate } from "serwist";

declare const self: any & {
  __SW_MANIFEST: (string | { revision: string; url: string })[];
};

const OFFLINE_FALLBACK_URL = "/~offline";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,

  // Activate immediately — prevents users being stuck on old versions
  skipWaiting: true,
  clientsClaim: true,

  // Navigation preload improves performance on supported browsers
  navigationPreload: true,

  runtimeCaching: [
    // -------------------------------------------------------------------------
    // DO NOT CACHE — Authentication and sensitive routes
    // These must always go to the network; never serve from cache
    // -------------------------------------------------------------------------
    // (No explicit rule needed — they simply won't match any cache rule below)

    // -------------------------------------------------------------------------
    // Cloudinary images — CacheFirst (1 week)
    // Company images are hosted on Cloudinary; cache them for offline display
    // -------------------------------------------------------------------------
    {
      matcher: ({ url }) => url.hostname === "res.cloudinary.com",
      handler: new CacheFirst({
        cacheName: "utc-cloudinary-images",
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              return response.status === 200 ? response : null;
            },
          },
        ],
      }),
    },

    // -------------------------------------------------------------------------
    // Google Fonts stylesheets — StaleWhileRevalidate
    // -------------------------------------------------------------------------
    {
      matcher: ({ url }) => url.origin === "https://fonts.googleapis.com",
      handler: new StaleWhileRevalidate({
        cacheName: "utc-google-fonts-stylesheets",
      }),
    },

    // -------------------------------------------------------------------------
    // Google Fonts files — CacheFirst (1 year)
    // -------------------------------------------------------------------------
    {
      matcher: ({ url }) => url.origin === "https://fonts.gstatic.com",
      handler: new CacheFirst({
        cacheName: "utc-google-fonts-webfonts",
      }),
    },

    // -------------------------------------------------------------------------
    // Next.js static assets — StaleWhileRevalidate
    // /_next/static/** (JS chunks, CSS, etc.)
    // -------------------------------------------------------------------------
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
      handler: new StaleWhileRevalidate({
        cacheName: "utc-next-static-assets",
      }),
    },

    // -------------------------------------------------------------------------
    // Public static files (icons, images in /public)
    // -------------------------------------------------------------------------
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/icons/") ||
        url.pathname.endsWith(".png") ||
        url.pathname.endsWith(".svg") ||
        url.pathname.endsWith(".ico"),
      handler: new CacheFirst({
        cacheName: "utc-public-assets",
      }),
    },

    // -------------------------------------------------------------------------
    // Navigation requests — NetworkFirst with offline fallback
    // Admin routes are intentionally NOT cached with fallback (security)
    // -------------------------------------------------------------------------
    {
      matcher: ({ request, url }) => {
        if (request.mode !== "navigate") return false;
        // DO NOT cache admin navigation
        if (url.pathname.startsWith("/admin")) return false;
        // DO NOT cache login page (auth-related)
        if (url.pathname.startsWith("/login")) return false;
        return true;
      },
      handler: new NetworkFirst({
        cacheName: "utc-pages",
        networkTimeoutSeconds: 5,
      }),
    },

    // -------------------------------------------------------------------------
    // Default cache strategies for remaining requests
    // -------------------------------------------------------------------------
    ...defaultCache,
  ],

  // Offline fallback for navigation when all else fails
  fallbacks: {
    entries: [
      {
        url: OFFLINE_FALLBACK_URL,
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
