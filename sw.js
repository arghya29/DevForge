/* ═══════════════════════════════════════════════════════════
   DevForge — Service Worker
   Caches static assets for offline support.
   Since DevForge is a zero-dependency static site, the SW
   simply caches the full app on first load and serves from
   cache when offline.
╔═══════════════════════════════════════════════════════════════ */
/* global Response */

const CACHE = "devforge-v2";

// Scope-relative paths so the same worker functions regardless of the base path
// it is served from — GitHub Pages (/DevForge/), Netlify (/), a custom domain, or
// local dev at the root. Each entry resolves against the worker's own location.
const PRECACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./curriculum.js",
  "./storage.js",
  "./analytics.js",
  "./ui.js",
  "./editor.js",
  "./lesson.js",
  "./preview.js",
  "./commands.js",
  "./achievements.js",
  "./a11y.js",
  "./perf.js",
  "./snippet.js",
  "./export.js",
  "./layout.js",
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
      // disable offline support entirely. Rejected entries are logged so a
      // failed asset is diagnosable rather than silently swallowed.
      Promise.allSettled(PRECACHE.map(url => cache.add(url))).then(results => {
        results.forEach((result, i) => {
          if (result.status === "rejected") {
            console.warn(`[DevForge SW] Failed to precache ${PRECACHE[i]}:`, result.reason);
          }
        });
      })
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

// ── Background Sync for offline analytics ──
self.addEventListener("sync", event => {
  if (event.tag === "sync-analytics") {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: "flush-offline-queue" }));
      })
    );
  }
});

// ── Periodic Sync for data backup ──
self.addEventListener("periodicsync", event => {
  if (event.tag === "backup-snapshots") {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: "backup-snapshots" }));
      })
    );
  }
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
          if (cached) {
            return cached;
          }
          try {
            return new Response(
              '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>DevForge — Offline</title><style>body{background:#0d1117;color:#e6edf3;font-family:"Inter",sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;text-align:center}.card{background:#161b22;border:1px solid #30363d;border-radius:16px;padding:40px;max-width:420px}h1{font-size:1.4rem;color:#58a6ff;margin-bottom:12px}p{color:#8b949e;line-height:1.7;font-size:.9rem}.emoji{font-size:3rem;display:block;margin-bottom:16px}button{margin-top:12px;padding:10px 24px;border:none;border-radius:8px;background:#58a6ff;color:#0d1117;font-size:.9rem;font-weight:600;cursor:pointer;display:block;width:100%}button:hover{background:#79b8ff}.sep{margin:20px 0;border:none;border-top:1px solid #30363d}</style></head><body><div class="card"><span class="emoji">📡</span><h1>You&#39;re Offline</h1><p>DevForge needs an internet connection to load.</p><button onclick="window.location.reload()">Try Again</button><hr class="sep"><h1 style="font-size:1.1rem">&#9888; Recovery Options</h1><p>If you lost progress, restore the last saved state.</p><button onclick="try{localStorage.setItem(\'devforge:recovery:restore\',\'1\')}catch(e){}window.location.reload()">Restore Last Session</button></div></body></html>',
              { headers: { "Content-Type": "text/html;charset=UTF-8" } }
            );
          } catch {
            return Response.error();
          }
        });
      return cached || fetched;
    })
  );
});
