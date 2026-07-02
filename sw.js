/* ═══════════════════════════════════════════════════════════
   DevForge — Service Worker
   Caches static assets for offline support.
   Since DevForge is a zero-dependency static site, the SW
   simply caches the full app on first load and serves from
   cache when offline.
═══════════════════════════════════════════════════════════ */

const CACHE = "devforge-v1";

// Scope-relative paths so the same worker functions regardless of the base path
// it is served from — GitHub Pages (/DevForge/), Netlify (/), a custom domain, or
// local dev at the root. Each entry resolves against the worker's own location.
const PRECACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./curriculum.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./offline.html",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      // Cache each entry independently so one missing/renamed asset (or a
      // transient failure on a single file) can't reject the whole install and
      // disable offline support entirely.
      Promise.allSettled(PRECACHE.map(url => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))).then(() =>
        self.clients.claim()
      );
    })
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const isNavigation = event.request.mode === "navigate";
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
        .catch(() => {
          if (isNavigation) return caches.match("./offline.html");
          return cached || Response.error();
        });
      return cached || fetched;
    })
  );
});
