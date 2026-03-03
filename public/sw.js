const CACHE_NAME = 'eagle-pwa-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Basic cache-first for app shell
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      // cache GET requests for future
      if (req.method === 'GET' && res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy));
      }
      return res;
    })).catch(() => caches.match('/'))
  );
});

self.addEventListener('push', (event) => {
  let payload = { title: 'EAGLE', body: 'You have a new message', url: '/' };
  try {
    if (event.data) payload = event.data.json();
  } catch (e) {}
  const options = {
    body: payload.body,
    data: { url: payload.url },
    tag: payload.tag || 'eagle-push',
    renotify: true
  };
  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});