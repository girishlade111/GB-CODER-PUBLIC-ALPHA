/**
 * GB Coder — Phase 1 Service Worker Transition & Migration Worker
 *
 * Scope: '/' (Root Scope)
 *
 * Purpose:
 * Safely retires the legacy root-scoped Service Worker from Phase 0 / 0.5.
 * Unregisters the root registration, purges obsolete precache storage,
 * and allows the Astro marketing homepage at '/' to load cleanly without
 * interception, while leaving IndexedDB project data and LocalStorage 100% intact.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        // Take over active clients immediately
        if (self.clients && typeof self.clients.claim === 'function') {
          await self.clients.claim();
        }

        // Clean up obsolete workbox precaches from root deployment
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          if (name.startsWith('workbox-precache') || name.includes('gb-coder')) {
            await caches.delete(name);
          }
        }

        // Self-unregister the root scope
        if (self.registration && typeof self.registration.unregister === 'function') {
          await self.registration.unregister();
        }

        // Notify client tabs at root to refresh so they display the Astro marketing page
        const clients = await self.clients.matchAll({ type: 'window' });
        for (const client of clients) {
          try {
            const clientUrl = new URL(client.url);
            if (clientUrl.pathname === '/' || clientUrl.pathname === '/index.html') {
              client.navigate('/');
            }
          } catch {
            // Ignore client navigation failures
          }
        }
      } catch (err) {
        console.warn('[SW Migration] Transition error:', err);
      }
    })()
  );
});

// Pass-through fetch handler: never intercept requests during migration
self.addEventListener('fetch', () => {
  return;
});
