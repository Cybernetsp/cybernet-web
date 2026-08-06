const CACHE_NAME = "cybernet-cache-v76"; // Subimos la versión para que fuerce la actualización

// ⚡ ARRAY COMBINADO: Aquí guardamos los archivos de TODAS tus páginas
const assets = [
  "./", // Carga la raíz (usualmente tu index.html o página principal)
  
  // Archivos de tu panel de Administrador
  "./admin.html",
  "./global.css",
  "./logica.js",
  "./logo.jpeg"
  
  // Si tu "otra pag" usa un CSS o JS distinto, agrégalo aquí abajo:
  // "./otro-estilo.css",
  // "./otra-logica.js"
];

self.addEventListener("install", (e) => {
  // 1. Obliga a instalarse de inmediato sin esperar
  self.skipWaiting();

  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(assets))
  );
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

  // 2. Toma el control de la pantalla en este mismo segundo
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // 3. Estrategia "Cache-First": Busca primero en la memoria, si no está, va a internet
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
