const CACHE_NAME = "calendar-v2-2025-12-02";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./css/calendar.css",
  "./Estilos.css",
  "./main.js",
  "./js/calendar.js",
  "./192.png",
  "./512.png",
  "./icons/cal-192-v2.png",
  "./icons/cal-512-v2.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((k) => {
            if (k !== CACHE_NAME) return caches.delete(k);
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Cache-first for navigation & assets, fallback to network then offline page
self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Only handle navigation and GET requests
  if (req.method !== "GET") return;

  // For navigation, use network-first then cache fallback
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((resp) => {
          // Update cache
          caches.open(CACHE_NAME).then((c) => c.put(req, resp.clone()));
          return resp;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // For other requests: cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((response) => {
          // cache the file
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, response.clone());
            return response;
          });
        })
        .catch(() => {
          // optionally return a default offline image for images
          if (req.destination === "image")
            return caches.match("./icons/cal-192-v2.png");
        });
    })
  );
});
