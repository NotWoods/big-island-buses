const CACHE = 'network-or-cache';

export declare var self: ServiceWorkerGlobalScope;

self.addEventListener('install', evt => {
    evt.waitUntil(precache());
});

self.addEventListener('fetch', evt => {
    evt.respondWith(
        fromNetwork(evt.request, 400).catch(() => fromCache(evt.request)),
    );
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
            ]),
        );
}

function fromNetwork(request: RequestInfo, timeout: number) {
    return new Promise<Response>((resolve, reject) => {
        const timeoutId = setTimeout(reject, timeout);
        fetch(request).then(response => {
            clearTimeout(timeoutId);
            resolve(response);
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
                throw new Error('no-match');
            }
        });
}
