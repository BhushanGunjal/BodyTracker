const CACHE_NAME = 'bodytracker-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/core/app.js',
  '/js/core/chart.js',
  '/js/ui/auth-form.js',
  '/js/ui/hourly-form.js',
  '/js/ui/medication.js',
  '/js/services/auth.js',
  '/js/services/logs.js',
  '/js/services/firebase-init.js',
  '/js/utils/error-mapper.js'
];

// Install - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', event => {
  // Skip Firebase and external CDN requests
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('gstatic') ||
      event.request.url.includes('cdn.jsdelivr') ||
      event.request.url.includes('bootstrap')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
