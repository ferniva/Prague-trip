/* Service worker: la app funciona sin conexión con lo último que se cargó.
   Sube el número de versión si cambias la lista de archivos. */
const VERSION = 'tq-praga-v1';
const SHELL = ['./', 'index.html', 'app.js', 'data.js', 'config.js', 'manifest.webmanifest',
  'vendor/leaflet.js', 'vendor/leaflet.css', 'vendor/supabase.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
const TILES = 'tq-tiles', FONTS = 'tq-fonts';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => ![VERSION, TILES, FONTS].includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const timeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // App: primero red (para tener siempre lo último), si falla o tarda, la copia guardada.
  if (url.origin === self.location.origin) {
    e.respondWith((async () => {
      const cache = await caches.open(VERSION);
      try {
        const res = await timeout(fetch(req), 4000);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch (err) {
        const hit = await cache.match(req, { ignoreSearch: true });
        if (hit) return hit;
        if (req.mode === 'navigate') return (await cache.match('index.html')) || Response.error();
        return Response.error();
      }
    })());
    return;
  }

  // Mapa: lo ya visto queda guardado.
  if (url.hostname.endsWith('basemaps.cartocdn.com')) {
    e.respondWith((async () => {
      const cache = await caches.open(TILES);
      const hit = await cache.match(req.url);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok || res.type === 'opaque') cache.put(req.url, res.clone());
        return res;
      } catch (err) { return Response.error(); }
    })());
    return;
  }

  // Tipografías
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith((async () => {
      const cache = await caches.open(FONTS);
      const hit = await cache.match(req);
      const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })());
  }
  // Supabase y el resto: directo a la red.
});
