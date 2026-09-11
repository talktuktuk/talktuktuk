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

  event.respondWith(
    caches.match(request).then(cachedResponse => {

      // Use cached version if we already have it
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise get it from the internet
      return fetch(request).then(response => {

        // Save successful responses for future offline use
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
