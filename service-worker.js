var infoWorker = "worker/info.js";

const CACHE = 'big-island-buses-4';
self.addEventListener('install', (evt) => {
    evt.waitUntil(precache());
});
self.addEventListener('fetch', (evt) => {
    const url = new URL(evt.request.url);
    if (url.host === location.host) {
        if (url.pathname.includes('/routes/')) {
            // Route pages have same layout as main page
            evt.respondWith(fromCache('index.html'));
        }
        else {
            // Network then fallback
            evt.respondWith(fetch(evt.request));
            evt.waitUntil(update(evt.request));
        }
    }
    else {
        // External scripts (Google Maps) aren't cached
        evt.respondWith(fetch(evt.request));
    }
});
function precache() {
    return caches
        .open(CACHE)
        .then((cache) => cache.addAll([
        './',
        'index.html',
        'style.css',
        'main.js',
        'api.json',
        'manifest.json',
        'assets/logo.svg',
        'assets/pins.png',
        'assets/lines.svg',
        'assets/tigeroakes.svg',
        'icon/favicon.ico',
        'icon/maskable.png',
        'icon/transparent.png',
        infoWorker,
    ]));
}
function fromCache(request) {
    return caches
        .open(CACHE)
        .then((cache) => cache.match(request))
        .then((matching) => {
        if (matching) {
            return matching;
        }
        else {
            const url = typeof request === 'string' ? request : request.url;
            throw new Error(`${url} not cached`);
        }
    });
}
function update(request) {
    return caches.open(CACHE).then((cache) => {
        return fetch(request).then((response) => {
            return cache.put(request, response);
        });
    });
}
//# sourceMappingURL=service-worker.js.map
