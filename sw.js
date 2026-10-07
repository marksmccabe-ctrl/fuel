// fred service worker: keeps the app shell available offline.
// Forecast/geocode calls go to the network only; the app itself falls back to a saved forecast in localStorage.
// Cloud sync (only when a Firebase config is set): the Firebase SDK from www.gstatic.com is cached stale-while-revalidate so it
// loads offline after the first visit; Firestore, Google sign-in / token calls and the /__/ auth helper are never intercepted.
// Strava: the fred-api Worker (another host) is never intercepted, and neither is /strava/callback/.
// News: data/news.json is stale-while-revalidate (the last copy shows offline).
const CACHE = 'fred-shell-v83';
// the two marker fonts (Races graffiti, Ready Freddy title) are precached so they work offline from the first visit
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  './assets/fonts/permanent-marker-latin-400-normal.woff2', './assets/fonts/caveat-brush-latin-400-normal.woff2'];
// hosts the worker must never answer for (Firestore, Firebase Auth, Google sign-in)
const NEVER = /(^|\.)(firestore|identitytoolkit|securetoken|firebaseinstallations|oauth2|www)\.googleapis\.com$|(^|\.)firebaseapp\.com$|(^|\.)firebaseio\.com$|^(apis|accounts)\.google\.com$/;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (NEVER.test(url.hostname)) return; // Firestore / auth: straight to the network, never cached
  const isShell = url.origin === self.location.origin;
  if (isShell && url.pathname.includes('/__/')) return; // Firebase's sign-in helper (/__/auth/, /__/firebase/init.json)
  if (isShell && url.pathname.startsWith('/strava/')) return; // Strava's return page: always the network, never cached (it carries a one-time code)
  const isSdk = url.hostname === 'www.gstatic.com'; // the Firebase SDK (pinned version): stale-while-revalidate
  const isLib = url.host === 'cdnjs.cloudflare.com' || url.host === 'cdn.jsdelivr.net'; // html2canvas / xlsx / xlsx-js-style, loaded on demand (no third-party web fonts: the app uses the system font plus its own two self-hosted marker fonts)
  if (!isShell && !isLib && !isSdk) return; // weather APIs: network only
  if (isSdk) {
    const net = caches.open(CACHE).then(c => fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; })).catch(() => null);
    e.waitUntil(net.then(() => {}));
    e.respondWith(caches.open(CACHE).then(c => c.match(e.request)).then(cached => cached || net.then(r => r || Response.error())));
    return;
  }
  // News (q17): data/news.json stale-while-revalidate: the last copy answers at once (and offline); the fresh one is stored for next time.
  if (isShell && url.pathname.endsWith('/data/news.json')) {
    const net = caches.open(CACHE).then(c => fetch(e.request, { cache: 'no-cache' }).then(r => { if (r && r.ok) c.put(url.origin + url.pathname, r.clone()); return r; })).catch(() => null);
    e.waitUntil(net.then(() => {}));
    e.respondWith(caches.open(CACHE).then(c => c.match(url.origin + url.pathname)).then(cached => cached || net.then(r => r || new Response('{}', { status: 504, headers: { 'Content-Type': 'application/json' } }))));
    return;
  }
  // App files: network-first so updates show on the next open; cache is the offline fallback.
  // Libraries: cache-first.
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
