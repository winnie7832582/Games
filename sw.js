/* 離線快取。版本號來自 config.js，更版時不用改這個檔案。 */
importScripts('./config.js');
var V = self.GC_CONFIG.version;
var CACHE = 'gc-app-' + V, FONT = 'gc-fonts';
var SHELL = ['./', './index.html', './config.js', './gc.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png']
  .concat(self.GC_CONFIG.games.map(function (g) { return './' + g.file; }));
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL.map(function (u) { return new Request(u, { cache: 'reload' }); })); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k.indexOf('gc-app-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('message', function (e) { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('fetch', function (e) {
  var req = e.request; if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONT).then(function (c) { return c.match(req).then(function (hit) { return hit || fetch(req).then(function (res) { c.put(req, res.clone()); return res; }).catch(function () { return hit; }); }); }));
    return;
  }
  if (url.origin !== location.origin) return;
  if (url.pathname.endsWith('/sw.js')) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      return hit || fetch(req).then(function (res) { if (res.ok) c.put(req, res.clone()); return res; });
    });
  }).catch(function () { return fetch(req); }));
});
