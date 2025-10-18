// Service Worker for offline PWA functionality
const CACHE_NAME = "jspsych-offline-v1";

// Local files to cache
const localUrlsToCache = [
  "./",
  "index.html",
  "admin/",
  "admin/index.html",
  "manifest.json",
  "experiment.js",
  "admin/admin.js",
];

// CDN URLs to pre-cache (these will be cached on install)
const cdnUrlsToCache = [
  "https://unpkg.com/jspsych@8",
  "https://unpkg.com/@jspsych/plugin-html-button-response@2",
  "https://unpkg.com/@jspsych/plugin-html-keyboard-response@2",
  "https://unpkg.com/@jspsych/plugin-preload@2",
  "https://unpkg.com/@jspsych/offline-storage@0.4.0",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache local files. Resolve each relative URL against the service worker's scope
      // so this works when the app is hosted in a subdirectory.
      const resolvedLocalUrls = localUrlsToCache.map((u) => new URL(u, self.location).toString());

      // Instead of using cache.addAll (which rejects the entire install if any
      // single request fails), fetch and cache each URL individually so we can
      // log which ones fail and continue. This prevents the install from
      // failing due to a single missing/404 resource (which produced the
      // "Failed to execute 'addAll' on 'Cache': Request failed" error).
      for (const url of resolvedLocalUrls) {
        try {
          const resp = await fetch(url, { cache: 'no-cache' });
          if (!resp || !resp.ok) {
            console.warn(`ServiceWorker: failed to fetch ${url} (status: ${resp && resp.status})`);
            continue;
          }
          await cache.put(url, resp.clone());
        } catch (err) {
          console.warn(`ServiceWorker: error caching ${url}:`, err);
        }
      }

      // Cache CDN files (use try/catch to handle any failures gracefully)
      for (const url of cdnUrlsToCache) {
        try {
          await cache.add(url);
        } catch (error) {
          console.warn(`Failed to cache ${url}:`, error);
        }
      }
    }),
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // Clone the request
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        // Check if valid response
        if (!response || response.status !== 200) {
          return response;
        }

        // Don't cache non-GET requests
        if (event.request.method !== "GET") {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  // Claim all clients immediately
  return self.clients.claim();
});
