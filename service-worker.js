const CACHE_NAME = 'talk-tuk-tuk-v2';

const APP_FILES = [
  './',
  './index.html',
  './manifest.json',
  './NEW_TTT_LOGO.png',
  './KHMER-FLAG-LOGO.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
  );

  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Handle video files specially
  if (request.url.endsWith('.mp4')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {

        const cachedResponse = await cache.match(request.url);

        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const response = await fetch(request);

          if (response.ok) {
            await cache.put(request.url, response.clone());
          }

          return response;

        } catch (error) {
          return new Response('Video unavailable offline', {
            status: 503,
            statusText: 'Offline'
          });
        }
      })
    );

    return;
  }

  // Normal files
  event.respondWith(
    caches.match(request).then(cachedResponse => {

      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then(response => {

        if (response.ok) {
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }

        return response;
      });
    })
  );
});
