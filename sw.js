const CACHE_NAME = 'cybernet-cache-v6'; // Subimos la versión para forzar la limpieza

// Solo guardamos el index y el logo. El admin.html queda fuera.
const assets = [
  './', 
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
});

// Esta función es vital: borrará la caché vieja que tenía atrapado tu diseño anterior
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
