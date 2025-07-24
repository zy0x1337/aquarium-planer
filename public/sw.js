const CACHE_NAME = 'aquarium-planer-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

// Cache-Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache geöffnet');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache-Aktivierung
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Alter Cache gelöscht', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch-Events abfangen
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache-Hit - Response aus Cache zurückgeben
        if (response) {
          return response;
        }
        
        // Cache-Miss - Netzwerk-Request
        return fetch(event.request).then(
          (response) => {
            // Prüfen ob gültige Response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Response klonen für Cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // Offline-Fallback für HTML-Seiten
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Background-Sync für spätere Synchronisation
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Hier können später Daten synchronisiert werden
  console.log('Background Sync ausgeführt');
}
