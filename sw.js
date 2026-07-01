/* ═══════════════════════════════════════════════════════════
   DevForge — Service Worker
   Caches static assets for offline support.
   Since DevForge is a zero-dependency static site, the SW
   simply caches the full app on first load and serves from
   cache when offline.
═══════════════════════════════════════════════════════════ */

const CACHE = "devforge-v1";

const PRECACHE = [
  "/DevForge/",
  "/DevForge/index.html",
  "/DevForge/styles.css",
  "/DevForge/app.js",
  "/DevForge/curriculum.js",
  "/DevForge/manifest.json",
  "/DevForge/offline.html",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(PRECACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetched = fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match("/DevForge/offline.html"));
      return cached || fetched;
    })
  );
});
