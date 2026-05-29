const CACHE_NAME = 'congak-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icon-192.png',  // Tambah baris ini
  './icon-512.png'   // Tambah baris ini
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});