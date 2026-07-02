// ===== Service Worker · Mis Finanzas Personales · v11g =====
// CAMBIA el número de versión (v11g) cada vez que actualices la app.
// Eso obliga al navegador a botar la copia vieja y traer la nueva.
const CACHE = 'mfp-v11g';
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icono-192.png',
  './icono-512.png'
];

// Instalar: guarda los archivos de esta versión
self.addEventListener('install', function(e){
  self.skipWaiting(); // activa la versión nueva de inmediato
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ARCHIVOS); })
  );
});

// Activar: borra las cachés viejas (versiones anteriores)
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(claves){
      return Promise.all(
        claves.filter(function(k){ return k !== CACHE; })
              .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

// Buscar: primero la red (para traer lo último); si no hay internet, usa la copia guardada
self.addEventListener('fetch', function(e){
  e.respondWith(
    fetch(e.request)
      .then(function(resp){
        var copia = resp.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copia); });
        return resp;
      })
      .catch(function(){ return caches.match(e.request); })
  );
});
