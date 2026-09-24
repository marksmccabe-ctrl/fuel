// Bluebird Fuel service worker: keeps the app shell available offline.
// Forecast/geocode calls go to the network only; the app itself falls back to a saved forecast in localStorage.
const CACHE = 'bluebird-shell-v1';
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
  // stale-while-revalidate: serve cached, refresh in the background
  e.respondWith(caches.open(CACHE).then(async c => {
    const cached = await c.match(e.request, { ignoreSearch: isShell });
    const net = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    return cached || (await net) || (isShell ? c.match('./index.html') : Response.error());
  }));
});
