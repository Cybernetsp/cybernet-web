const CACHE_NAME = "cybernet-cache-v107"; // 🚀 Subimos a v95 para eliminar cachés viejas

// ⚡ LISTA DE ARCHIVOS PRINCIPALES DE LA APP
const assets = [
  "./",
  "./index.html",
  "./tienda.html",
  "./tienda.css",
  "./tienda.js",
  "./logo.jpeg",
  "./manifest.json"
];

// 1. INSTALACIÓN: Carga archivos base e ignora esperas
self.addEventListener("install", (e) => {
  self.skipWaiting();

  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets).catch((err) => console.log("Error precarga caché:", err));
    })
  );
});

// 2. ACTIVACIÓN: Borra automáticamente las versiones viejas (v93, v94, etc.)
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

// 3. ESTRATEGIA "NETWORK-FIRST": Busca siempre en internet primero.
// Si hay conexión, entrega lo más nuevo de GitHub y refresca la memoria.
// Si está sin internet (offline), entrega la copia de respaldo.
self.addEventListener("fetch", (e) => {
  // Ignorar peticiones POST/GET de las APIs para no bloquear el backend
  if (e.request.url.includes("api.cybernetsp.com") || e.request.url.includes("script.google.com")) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && e.request.method === "GET") {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
