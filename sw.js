// Bluebird Fuel service worker: keeps the app shell available offline.
// Forecast/geocode calls go to the network only; the app itself falls back to a saved forecast in localStorage.
const CACHE = 'bluebird-shell-v5';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const isShell = url.origin === self.location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/.test(url.host);
  if (!isShell && !isFont) return; // weather APIs: network only
  // App files: network-first so updates show on the next open; cache is the offline fallback.
  // Fonts: cache-first.
  e.respondWith(caches.open(CACHE).then(async c => {
    if (isShell) {
      try {
        const r = await fetch(e.request, { cache: 'no-cache' });
        if (r && r.ok) c.put(e.request, r.clone());
        return r;
      } catch (_) {
        return (await c.match(e.request, { ignoreSearch: true })) || (await c.match('./index.html')) || Response.error();
      }
    }
    const cached = await c.match(e.request);
    if (cached) return cached;
    const r = await fetch(e.request).catch(() => null);
    if (r && r.ok) c.put(e.request, r.clone());
    return r || Response.error();
  }));
});
