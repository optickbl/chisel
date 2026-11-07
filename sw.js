// Chisel offline cache. The page is fetched fresh when online (so updates arrive) and served from the cache when offline.
const CACHE = 'chisel-4scan1107', FONTS = 'chisel-fonts';
const CORE = ['./', './index.html', './three.min.js', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png', './dynapuff-latin-400-normal.woff2', './dynapuff-latin-500-normal.woff2', './dynapuff-latin-600-normal.woff2', './dynapuff-latin-700-normal.woff2', './nunito-latin-400-normal.woff2', './nunito-latin-500-normal.woff2', './nunito-latin-600-normal.woff2', './nunito-latin-700-normal.woff2', './nunito-latin-800-normal.woff2', './nunito-latin-900-normal.woff2', './stage-1.webp', './stage-2.webp', './stage-3.webp', './stage-4.webp', './stage-5.webp', './stage-6.webp', './stage-7.webp', './stage-8.webp', './stage-9.webp', './stage-10.webp'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== FONTS).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const url = new URL(r.url);
  if (url.origin === location.origin){
    if (r.mode === 'navigate'){
      e.respondWith(fetch(r).then(res => { if (res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); } return res; })
        .catch(() => caches.match('./index.html', { ignoreSearch: true })));
      return;
    }
    e.respondWith(caches.match(r, { ignoreSearch: true }).then(m => m || fetch(r).then(res => { if (res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; })));
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'){
    e.respondWith(caches.open(FONTS).then(c => c.match(r).then(m => {
      const net = fetch(r).then(res => { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }).catch(() => m);
      return m || net;
    })));
  }
});
