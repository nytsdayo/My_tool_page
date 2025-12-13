// Service Worker for Canvas Memo 2 PWA
const CACHE_NAME = 'canvas-memo-2-v1';
const urlsToCache = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-72.png',
  './icon-96.png',
  './icon-128.png',
  './icon-144.png',
  './icon-152.png',
  './icon-192.png',
  './icon-384.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Critical files that must be cached
        const criticalFiles = ['./index.html', './style.css', './script.js', './manifest.json'];
        // Optional files (icons)
        const optionalFiles = urlsToCache.filter(url => !criticalFiles.includes(url));
        
        // Cache critical files - fail if any fail
        const criticalPromise = Promise.all(
          criticalFiles.map(url => cache.add(url))
        );
        
        // Cache optional files - don't fail if some fail
        const optionalPromise = Promise.allSettled(
          optionalFiles.map(url => 
            cache.add(url).catch(err => {
              console.log(`Optional file failed to cache ${url}:`, err);
            })
          )
        );
        
        return Promise.all([criticalPromise, optionalPromise]);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch((error) => {
          console.log('Fetch failed:', error);
          // Return a custom offline page if available
          return caches.match('./index.html');
        });
      })
  );
});

// Message event - handle messages from the application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
