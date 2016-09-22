importScripts('js/serviceworker-cache-polyfill.js');

const CACHE_NAME = "goride-cache-1"
var cacheList = [
	"/",
	"/important.css",
	"/style.css",
	"/js/ui.js",
	"/api-worker.js",
	"/icon/bus-icon-24.png",
];

self.addEventListener("install", function(e) {
	e.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
		console.log("opened cache");
		return cache.addAll(cacheList);
	}));
});

self.addEventListener("activate", function(e) {
	e.waitUntil(caches.keys().then(function(cacheNames) {
		return Promise.all(cacheNames.map(function(cacheName) {
			if (cacheName != CACHE_NAME) {return caches.delete(cacheName);}
		}));
	}));
});

self.addEventListener("fetch", function(e) {
	e.respondWith(caches.match(e.request).then(function(response) {
		//if in cache
		if (response) {return response;}
		//otherwise the internet
		return fetch(e.request);
	}));
})