const CACHE_NAME = 'congak-cache-v9'; 
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icon01.png',  
  './icon02.png'   
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