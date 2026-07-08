const CACHE_NAME = "cybernet-cache-v29"; // Súbele una versión más por si acaso

const assets = ["./"];

self.addEventListener("install", (e) => {
  // 1. ESTA LÍNEA ES NUEVA: Obliga a instalarse de inmediato sin esperar
  self.skipWaiting();

  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(assets)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
    }),
  );

  // 2. ESTA LÍNEA ES NUEVA: Toma el control de la pantalla en este mismo segundo
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
