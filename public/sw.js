const CACHE_NAME = "utc-dispatch-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Network-first behavior.
  // Do not cache application/API responses yet.
});