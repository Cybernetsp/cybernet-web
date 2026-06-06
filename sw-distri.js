const CACHE_NAME = "cyber-distri-v3";

// 🔥 FIX: Agregamos "./distris.jpeg" a la lista para que el celular la guarde en memoria
const assetsToCache = [
  "./distribuidores.html",
  "./distribuidores.js",
  "./global.css",
  "./distris.jpeg" 
];

// Instala el motor y guarda tu web y el logo en la memoria del celular
self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assetsToCache);
    })
  );
});

// Intercepta la red para que la app cargue rápido como una nativa
self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request);
    })
  );
});
