const CACHE_NAME = "cyber-distri-v14"; // 🔄 Cambiamos a V2 para forzar al celular a borrar el error anterior

const assetsToCache = [
  "./distribuidores",
  "./distribuidores.js",
   "./distribuidores.css",
  "./distris.jpeg" 
];

// ⏳ INSTALACIÓN: Guarda los archivos locales en la memoria del celular
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // 🔥 BLINDAJE 1: Mapeamos los archivos uno a uno con un .catch()
      // Si "distris.jpeg" no existe o está mal copiado, el sistema lo ignora y la app SIGUE FUNCIONANDO.
      return Promise.all(
        assetsToCache.map(url => {
          return cache.add(url).catch(err => console.warn(`Aviso: No se pudo precachear ${url}. Detalle:`, err));
        })
      );
    }).then(() => self.skipWaiting()) // Fuerza la activación inmediata sin quedarse esperando
  );
});

// 🧹 ACTIVACIÓN: Borra basuras y bloqueos de la versión V1 anterior
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 🛡️ MOTOR DE PETICIONES: El escudo anti-congelamiento
self.addEventListener("fetch", e => {
  // 🔥 BLINDAJE 2: Ignora peticiones que no sean GET (como el envío de ventas POST)
  if (e.request.method !== "GET") return;

  // 🔥 BLINDAJE 3: Si la petición va hacia Google Sheets o APIs externas, 
  // la dejas pasar directo a internet sin tocar el caché.
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse; // Si el archivo HTML/JS/CSS está en caché, lo sirve al instante
      }
      
      // Si es un archivo local nuevo, lo busca en la red de forma segura
      return fetch(e.request).catch(err => {
        console.error("Error de red interceptado de forma segura:", err);
        // 🔥 BLINDAJE 4: En vez de tumbar la app con un ERR_FAILED, devuelve una respuesta limpia
        return new Response("Cybernet: Error de conexión temporal.", { 
          status: 503, 
          statusText: "Service Unavailable",
          headers: new Headers({ "Content-Type": "text/plain; charset=utf-8" })
        });
      });
    })
  );
});
