const CACHE_NAME = 'talk-tuk-tuk-v3';

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

  // Handle MP4 videos specially
  if (request.url.endsWith('.mp4')) {

    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {

        const cached = await cache.match(request.url);

        if (cached) {

          const range = request.headers.get('range');

          // Normal video request
          if (!range) {
            return cached;
          }

          // Video player is asking for a specific byte range
          const buffer = await cached.arrayBuffer();
          const size = buffer.byteLength;

          const match = range.match(/bytes=(\d+)-(\d*)/);

          if (!match) {
            return cached;
          }

          const start = Number(match[1]);
          const end = match[2]
            ? Math.min(Number(match[2]), size - 1)
            : size - 1;

          if (start >= size) {
            return new Response(null, {
              status: 416,
              headers: {
                'Content-Range': 'bytes */' + size
              }
            });
          }

          const chunk = buffer.slice(start, end + 1);

          return new Response(chunk, {
            status: 206,
            statusText: 'Partial Content',
            headers: {
              'Content-Type': 'video/mp4',
              'Content-Length': chunk.byteLength,
              'Content-Range':
                'bytes ' + start + '-' + end + '/' + size,
              'Accept-Ranges': 'bytes'
            }
          });
        }

        // Video wasn't cached — get it online
        try {
          const response = await fetch(request);

          if (response.ok) {
            await cache.put(request.url, response.clone());
          }

          return response;

        } catch (error) {
          return new Response('Video unavailable offline', {
            status: 503
          });
        }
      })
    );

    return;
  }

  // Everything else:
  // use cache if available, otherwise use the internet
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
