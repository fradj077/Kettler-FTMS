const C = 'kettler-v93', F = ['./', './index.html', './manifest.json', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(F))); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => clients.claim())));
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  // Network first for index.html to guarantee fresh version
  if(e.request.url.includes('index.html') || e.request.mode === 'navigate'){
    e.respondWith(fetch(e.request).then(r => {
      if(r.ok){ const copy = r.clone(); caches.open(C).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(fetch(e.request).then(r => {
    if(r.ok && new URL(e.request.url).origin === location.origin){ const copy = r.clone(); caches.open(C).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
