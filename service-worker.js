var e="worker/closest-stop.js";const s="big-island-buses-4";function t(e){return caches.open(s).then(s=>s.match(e)).then(s=>{if(s)return s;{const s="string"==typeof e?e:e.url;throw new Error(`${s} not cached`)}})}self.addEventListener("install",t=>{t.waitUntil(caches.open(s).then(s=>s.addAll(["./","index.html","style.css","main.js","api.json","manifest.json","assets/logo.svg","assets/pins.png","assets/lines.svg","assets/tigeroakes.svg","icon/favicon.ico","icon/maskable.png","icon/transparent.png",e])))}),self.addEventListener("fetch",e=>{const n=new URL(e.request.url);n.host===location.host?n.pathname.includes("/routes/")?e.respondWith(t("index.html")):(e.respondWith(t(e.request)),e.waitUntil(function(e){return caches.open(s).then(s=>fetch(e).then(t=>s.put(e,t)))}(e.request))):e.respondWith(fetch(e.request))});
//# sourceMappingURL=service-worker.js.map
