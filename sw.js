/* ===========================================================
   sw.js — Service Worker de "Mis Finanzas Personales"

   OBJETIVO:
   - Que la app sea INSTALABLE como aplicación real en Android/iOS,
     para que tome su ícono del manifest (no el ícono gris genérico).
   - SIN volver al problema anterior de caché que bloqueaba las
     actualizaciones.

   ESTRATEGIA: NETWORK-FIRST (la red manda).
   - Siempre intenta traer la versión más reciente desde internet.
   - Solo usa la copia guardada si el teléfono está SIN conexión.
   Resultado: el ícono se instala bien y, con internet, siempre
   ves la última versión al recargar.
   =========================================================== */

const CACHE = 'mfp-cache-v1';

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        // Borra cualquier caché de versiones anteriores.
        return Promise.all(
          keys.filter(function (k) { return k !== CACHE; })
              .map(function (k) { return caches.delete(k); })
        );
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(function (resp) {
        // Guarda una copia fresca (solo como respaldo sin internet).
        var copia = resp.clone();
        caches.open(CACHE)
          .then(function (c) { c.put(event.request, copia); })
          .catch(function () {});
        return resp;
      })
      .catch(function () {
        // Sin conexión: usa lo último guardado.
        return caches.match(event.request);
      })
  );
});
