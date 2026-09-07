/* AgriSphere service worker — offline-capable shell for the chat UI + platform pages */
const CACHE = 'agrisphere-v2';
const SHELL = [
  '/',
  '/index.html',
  '/market.html',
  '/prices.html',
  '/account.html',
  '/ussd.html',
  '/biz.html',
  '/programs.html',
  '/tourism.html',
  '/partner.html',
  '/styles.css',
  '/app.js',
  '/market.js',
  '/programs.js',
  '/biz.js',
  '/tourism.js',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // API calls: network-first so chat/feedback/marketplace stay live
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Static shell: cache-first for speed + offline
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }))
  );
});
