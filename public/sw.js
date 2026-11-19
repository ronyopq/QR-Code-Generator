/* QRForge service worker — offline app shell (GitHub Pages safe, relative scope)
 * Strategy: network-first for navigations so a fresh deploy is picked up
 * immediately, cache-first (with background refresh) for static assets.
 * Bump CACHE_VERSION on breaking changes.
 */
const CACHE_VERSION = 'qrforge-v4';
const CORE = ['./', './index.html', './favicon.svg', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
/* Filled in at build time (scripts/prerender.mjs) with this build's hashed
 * assets, so the *first* offline launch works — not just the second one.
 * An empty array is still valid (dev server, or a build without injection). */
const PRECACHE = [];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => Promise.allSettled([...CORE, ...PRECACHE].map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const sameOrigin = new URL(req.url).origin === self.location.origin;
  if (!sameOrigin) return;

  // Navigations: always try the network first, fall back to the cached shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put('./index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html').then((hit) => hit || caches.match('./')))
    );
    return;
  }

  // Static assets: cache-first, refresh in the background.
  event.respondWith(
    caches.match(req).then((hit) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => hit);
      return hit || network;
    })
  );
});
