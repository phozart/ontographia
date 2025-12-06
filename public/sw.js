self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Minimal passthrough fetch handler to keep SW active without custom caching.
self.addEventListener('fetch', () => {});
