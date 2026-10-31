/* 離線快取。
   ★ 每次更新都要把下面的 BUILD 改成新版本號，並且上傳這個檔案。
   （iPhone 的 Safari 只看 sw.js 本身有沒有變，sw.js 沒變就不會更新，舊裝置會一直用舊檔案。） */
var BUILD = '1.17.2';
importScripts('./config.js?v=' + BUILD);
var CACHE = 'gc-app-' + BUILD, FONT = 'gc-fonts';
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
  /* 背景音樂：存在獨立的快取，更新版本時不用重新下載 */
  if (/\/audio\/.+\.mp3$/.test(url.pathname)) {
    e.respondWith(caches.open('gc-audio').then(function (c) { return c.match(req, { ignoreSearch: true }).then(function (hit) { return hit || fetch(req).then(function (res) { if (res.status === 200) c.put(req, res.clone()); return res; }); }); }));
    return;
  }
  /* 圖示：先用快取。網頁、程式、設定：有網路就拿最新的，沒網路才用快取 */
  if (/\/icons\//.test(url.pathname)) {
    e.respondWith(caches.open(CACHE).then(function (c) { return c.match(req, { ignoreSearch: true }).then(function (hit) { return hit || fetch(req); }); }));
    return;
  }
  e.respondWith(caches.open(CACHE).then(function (c) {
    return fetch(req, { cache: 'no-cache' }).then(function (res) { if (res.ok) c.put(req, res.clone()); return res; })
      .catch(function () { return c.match(req, { ignoreSearch: true }).then(function (hit) { return hit || Response.error(); }); });
  }));
});
