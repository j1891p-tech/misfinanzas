/* ===========================================================
   sw.js — KILL-SWITCH
   Este Service Worker no cachea nada: su única función es
   desinstalar cualquier Service Worker viejo que haya quedado
   registrado en el navegador del usuario, borrar su caché y
   recargar la página con la versión actual.

   Al subirlo a la raíz del repositorio (junto a index.html),
   los navegadores que aún tengan el SW antiguo lo reemplazan
   por este en la siguiente visita y quedan limpios solos.
   =========================================================== */

self.addEventListener('install', function () {
  // Tomar control de inmediato, sin esperar.
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    (async function () {
      try {
        // 1. Borrar TODA la caché guardada por versiones anteriores.
        const nombres = await caches.keys();
        await Promise.all(nombres.map(function (n) { return caches.delete(n); }));

        // 2. Desinstalar este propio Service Worker.
        await self.registration.unregister();

        // 3. Recargar todas las pestañas abiertas de la app
        //    para que muestren la versión nueva sin caché.
        const clientes = await self.clients.matchAll({ type: 'window' });
        clientes.forEach(function (c) {
          c.navigate(c.url);
        });
      } catch (e) {
        // Si algo falla, igual intentamos desinstalar.
        try { await self.registration.unregister(); } catch (_) {}
      }
    })()
  );
});
