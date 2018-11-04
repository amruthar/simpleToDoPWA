const cacheName = 'todo-app-cache';

const staticAssets = [
  './',
  './app.js',
  './styles.css',
  './fallback.json',
  './images/img/icons/'
];

self.addEventListener('install', async function () {
  const cache = await caches.open(cacheName);
  cache.addAll(staticAssets);
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  
  const request = event.request;
  const url = new URL(request.url);
  /*if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request));
  } else {*/
    event.respondWith(networkFirst(request));
  //}
});

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  return cachedResponse || fetch(request);
}

async function networkFirst(request) {
  const cache = await caches.open(cacheName);
  try {

    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (err) {
    const cachedResponse = await caches.match(request);
    const fallbackResponse = await caches.match('./fallback.json');
    return cachedResponse || fallbackResponse;
  }
}