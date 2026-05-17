const CACHE_NAME = 'greenguard-v1';
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/flora-genius-logo.png',
  '/favicon.ico',
  '/globe.svg',
  '/window.svg'
];

// Install service worker and cache base assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching offline assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper to determine if an asset is static
function isStaticAsset(url) {
  const path = url.pathname;
  return (
    url.hostname === self.location.hostname &&
    (path.startsWith('/_next/static/') ||
     path.startsWith('/public/') ||
     path.endsWith('.js') ||
     path.endsWith('.css') ||
     path.endsWith('.png') ||
     path.endsWith('.jpg') ||
     path.endsWith('.jpeg') ||
     path.endsWith('.gif') ||
     path.endsWith('.svg') ||
     path.endsWith('.ico') ||
     path.endsWith('.woff') ||
     path.endsWith('.woff2') ||
     path.endsWith('.ttf') ||
     path.endsWith('.otf'))
  );
}

// Fetch event listener
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // CRITICAL: Do NOT intercept Supabase auth calls or backend auth calls
  if (
    (url.hostname.includes('supabase.co') && url.pathname.includes('/auth/')) ||
    url.pathname.includes('/api/auth/')
  ) {
    console.log('[Service Worker] Bypassing Supabase/Auth call:', event.request.url);
    return; // Do not intercept, let network handle it directly
  }

  // Cache-First Strategy for static assets
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          // Check if we received a valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Cache the fetched static asset dynamically
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        }).catch(() => {
          // If network fails for a static asset, return nothing (graceful fail)
        });
      })
    );
    return;
  }

  // Network-First Strategy for API calls and Page Routes
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful GET responses for pages/API requests dynamically
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed (offline), attempt to serve from cache
        console.log('[Service Worker] Offline, serving from cache:', event.request.url);
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If no cached response exists and it's an API call, we let it fail naturally
          return Promise.reject(new Error('Network offline and no cache matches.'));
        });
      })
  );
});
