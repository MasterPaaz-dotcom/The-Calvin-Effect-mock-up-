// Bump VERSION whenever you change any file, so phones fetch the update.
const VERSION = 'calvin-effect-v3';
const FILES = ['./','index.html','style.css','app.js','manifest.json','logo.png','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install', e => {
  // cache:'reload' skips the browser's own HTTP cache, so a new version never installs old files
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(FILES.map(f => fetch(new Request(f, {cache: 'reload'})).then(r => { if (!r.ok) throw new Error(f); return c.put(f, r); })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  const code = u.origin === location.origin && (e.request.mode === 'navigate' || /\.(html|js|css|json)$/.test(u.pathname) || u.pathname.endsWith('/'));
  if (code) {   // pages and code: newest version first, saved copy when offline
    e.respondWith(fetch(e.request, {cache: 'no-cache'}).then(r => { const copy = r.clone(); if (r.ok) caches.open(VERSION).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request, {ignoreSearch: true}).then(hit => hit || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(hit => hit || fetch(e.request).catch(() => caches.match('index.html'))));
});
