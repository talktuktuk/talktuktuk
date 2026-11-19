// Talk Tuk Tuk service worker
const CACHE = 'ttt-shell-v1';

const VIDEO_BASE =
  'https://raw.githubusercontent.com/Mickalacki/talktuktuk/main/';

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) {
          return k !== CACHE;
        }).map(function (k) {
          return caches.delete(k);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;

  if (req.method !== 'GET') return;

  var url = new URL(req.url);

  // Handle saved Premium videos
  if (
    url.origin === self.location.origin &&
    url.pathname.startsWith('/premium-offline/') &&
    /\.mp4$/i.test(url.pathname)
  ) {
    e.respondWith(
      (async function () {
        var cache = await caches.open(CACHE);
        var saved = await cache.match(url.href);

        if (!saved) {
          return new Response('Premium video not saved offline', {
            status: 404
          });
        }

        return serveVideo(saved, req);
      })()
    );

    return;
  }

  // Handle Talk Tuk Tuk Free videos
  if (
    url.origin === 'https://raw.githubusercontent.com' &&
    url.href.startsWith(VIDEO_BASE) &&
    /\.mp4$/i.test(url.pathname)
  ) {
    e.respondWith(
      (async function () {
        var cache = await caches.open(CACHE);
        var saved = await cache.match(url.href);

        if (!saved) {
          return fetch(req);
        }

        return serveVideo(saved, req);
      })()
    );

    return;
  }

  // Leave other external websites alone.
  if (url.origin !== self.location.origin) return;

  // Network first for the app's own files.
  e.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) {
        c.put(req, copy);
      });
      return res;
    }).catch(function () {
      return caches.match(req);
    })
  );
});

// Serve saved videos, including browser range requests.
async function serveVideo(saved, req) {
  var range = req.headers.get('range');

  if (!range) {
    return saved;
  }

  var blob = await saved.blob();
  var size = blob.size;
  var match = range.match(/bytes=(\d*)-(\d*)/);

  if (!match) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': 'bytes */' + size }
    });
  }

  var start = match[1] ? Number(match[1]) : 0;
  var end = match[2] ? Number(match[2]) : size - 1;

  if (!match[1] && match[2]) {
    start = Math.max(0, size - Number(match[2]));
    end = size - 1;
  }

  if (start >= size || start > end) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': 'bytes */' + size }
    });
  }

  end = Math.min(end, size - 1);

  var headers = new Headers();
  headers.set(
    'Content-Type',
    saved.headers.get('Content-Type') || 'video/mp4'
  );
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Length', String(end - start + 1));
  headers.set(
    'Content-Range',
    'bytes ' + start + '-' + end + '/' + size
  );

  return new Response(
    blob.slice(start, end + 1),
    { status: 206, headers: headers }
  );
}
