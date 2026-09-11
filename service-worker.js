const CACHE_NAME = 'talk-tuk-tuk-v3';

const APP_FILES = [
  './',
  './index.html',
  './manifest.json',
  './NEW_TTT_LOGO.png',
  './KHMER-FLAG-LOGO.png'
];

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQm2y2b_Jnxuu_PUxIpFGlI4-jIvfdoQxSidqSUMDJ6PK9EQAFRXLB9ybl8lUjFgwWoBgvBdImTx4wZ/pub?gid=465524934&single=true&output=csv';

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

  if (request.method !== 'GET') return;

  /*
   * GOOGLE SHEETS CSV
   * Try internet first.
   * If offline, use the saved copy.
   */
  if (request.url === CSV_URL) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, copy);
            });
          }

          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );

    return;
  }

  /*
   * FREE MP4 VIDEOS
   */
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

          // Handle video player's byte-range request
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

        // Not downloaded yet — use internet
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

  /*
   * EVERYTHING ELSE
   */
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
