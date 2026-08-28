import CONFIG from '../scripts/config';
import logger from '../scripts/utils/logger';

const CACHE_NAME = 'storytel-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.png',
];

// Install Event: Pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      logger.info('[Service Worker] Caching static assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Network-first strategy with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests and API calls from caching
  if (request.method !== 'GET' || request.url.includes('/api/') || (CONFIG.API_URL && request.url.includes(CONFIG.API_URL))) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Push Event: Handle Web Push Notifications
self.addEventListener('push', (event) => {
  logger.info('[Service Worker] Push Notification Received');

  async function handlePush() {
    let title = 'Story Notification';
    let options = {
      body: 'Ada pemberitahuan baru!',
      icon: '/favicon.png',
      badge: '/favicon.png',
    };

    let storyId = null;

    if (event.data) {
      try {
        const payload = event.data.json();
        if (payload.title) {
          title = payload.title;
        }
        if (payload.options) {
          options = {
            ...options,
            ...payload.options,
          };
          if (payload.options.data && payload.options.data.id) {
            storyId = payload.options.data.id;
          }
        }
      } catch (err) {
        logger.critical('[Service Worker] Error parsing push notification payload:', err);
        options.body = event.data.text();
      }
    }

    // Broadcast message to all open window clients to refresh story list & markers
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientList) {
      client.postMessage({
        type: 'PUSH_NOTIFICATION_RECEIVED',
        message: 'REFRESH_STORIES',
        storyId,
        options,
      });
    }

    await self.registration.showNotification(title, options);
  }

  event.waitUntil(handlePush());
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  logger.info('[Service Worker] Notification Click Received');
  event.notification.close();

  const storyId = event.notification.data?.id;
  const targetUrl = storyId ? `/#/?storyId=${encodeURIComponent(storyId)}` : '/#/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            await client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
