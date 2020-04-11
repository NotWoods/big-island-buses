const CACHE = 'network-or-cache';

export declare var self: ServiceWorkerGlobalScope;

self.addEventListener('install', evt => {
  evt.waitUntil(precache());
});

self.addEventListener('fetch', evt => {
  const url = new URL(evt.request.url);
  if (url.host === location.host) {
    if (url.pathname.includes('/routes/')) {
      // Route pages have same layout as main page
      evt.respondWith(
        fromNetwork(evt.request, 400).catch(() => fromCache('index.html')),
      );
    } else {
      // Network then fallback
      evt.respondWith(
        fromNetwork(evt.request, 400).then(
          response => {
            // Update cache after network success
            evt.waitUntil(putInCache(evt.request, response));
            return response;
          },
          () => fromCache(evt.request),
        ),
      );
    }
  } else {
    // External scripts (Google Maps) aren't cached
    evt.respondWith(fetch(evt.request));
  }
});

function precache() {
  return caches
    .open(CACHE)
    .then(cache =>
      cache.addAll([
        './',
        'index.html',
        'style.css',
        'main.js',
        'api.json',
        'assets/logo.svg',
        'assets/lines.svg',
        'assets/tigeroakes.svg',
        'icon/favicon.ico',
        'icon/maskable.png',
        'icon/transparent.png',
      ]),
    );
}

function fromNetwork(request: RequestInfo, timeout: number) {
  return new Promise<Response>((fulfill, reject) => {
    const timeoutId = setTimeout(reject, timeout);
    fetch(request).then(response => {
      clearTimeout(timeoutId);
      fulfill(response);
    }, reject);
  });
}

function fromCache(request: RequestInfo) {
  return caches
    .open(CACHE)
    .then(cache => cache.match(request))
    .then(matching => {
      if (matching) {
        return matching;
      } else {
        throw new Error(`${request} not cached`);
      }
    });
}

function putInCache(request: RequestInfo, response: Response) {
  return caches.open(CACHE).then(cache => {
    return cache.put(request, response);
  });
}
