const CACHE = 'network-or-cache';
self.addEventListener('install', evt => {
    evt.waitUntil(precache());
});
self.addEventListener('fetch', evt => {
    evt.respondWith(fromNetwork(evt.request, 400).catch(() => fromCache(evt.request)));
});
function precache() {
    return caches
        .open(CACHE)
        .then(cache => cache.addAll([
        './',
        'index.html',
        'style.css',
        'main.js',
        'google_transit.zip',
        'assets/logo.svg',
        'assets/lines.svg',
        'roboto/Roboto-Regular.ttf',
        'roboto/Roboto-Medium.ttf',
    ]));
}
function fromNetwork(request, timeout) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(reject, timeout);
        fetch(request).then(response => {
            clearTimeout(timeoutId);
            resolve(response);
        }, reject);
    });
}
function fromCache(request) {
    return caches
        .open(CACHE)
        .then(cache => cache.match(request))
        .then(matching => {
        if (matching) {
            return matching;
        }
        else {
            throw new Error('no-match');
        }
    });
}
//# sourceMappingURL=service-worker.js.map
