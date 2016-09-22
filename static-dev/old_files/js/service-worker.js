self.addEventListener('install', function(e) {
	e.waitUntil(caches.open('v1').then(function(cache) {
		return cache.addAll(
			'index.html',
			'style.css',
			'/js/min.js',
			'output.json',
			'/assets/lines.svg',
			'/assets/favicon.ico',
			'/assets/bus-icon-48.png',
			'/assets/bus-icon-192.png',
			'/assets/apple-touch-icon-152.png',
			'/assets/pins.png'
		);
	}));
});

this.addEventListener('fetch', function(e) {
	e.respondWith(caches.match(e.request).catch(function() {
		return fetch(e.request);
	}));
});