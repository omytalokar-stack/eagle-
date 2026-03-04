const CACHE_NAME = 'eagle-pwa-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(err => {
      console.warn('[SW] Cache addAll error:', err);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Clean up old caches other than current
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // Skip non-GET requests (API calls handled separately)
  if (req.method !== 'GET') {
    return event.respondWith(fetch(req));
  }

  // Cache-first strategy for app shell and assets
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        console.log('[SW] Returning cached response for:', req.url);
        return cached;
      }
      
      return fetch(req).then((res) => {
        // Cache successful GET responses for future use
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => {
            c.put(req, copy);
          });
        }
        return res;
      }).catch(() => {
        // Fall back to cached index.html for offline navigation
        console.warn('[SW] Fetch failed for:', req.url, '- using fallback');
        return caches.match('/index.html');
      });
    })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  let payload = { 
    title: '🦅 EAGLE',
    body: 'You have a new message',
    url: '/',
    tag: 'eagle-push',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png'
  };
  
  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch (e) {
    console.warn('[SW] Push data parse error:', e);
  }

  const options = {
    body: payload.body,
    data: { url: payload.url || '/' },
    tag: payload.tag || 'eagle-push',
    renotify: true,
    requireInteraction: false,
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    dir: 'ltr',
    lang: 'en-US'
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options).then(() => {
      console.log('[SW] Notification shown:', payload.title);
    }).catch(err => {
      console.error('[SW] Notification error:', err);
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  
  const url = event.notification.data && event.notification.data.url 
    ? event.notification.data.url 
    : '/chat-live';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if a window with target URL is already open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === url && 'focus' in client) {
          console.log('[SW] Focusing existing window at:', url);
          return client.focus();
        }
      }
      // No window found, open new one
      if (clients.openWindow) {
        console.log('[SW] Opening new window at:', url);
        return clients.openWindow(url);
      }
    })
  );
});

// Handle notification closes
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification dismissed');
});