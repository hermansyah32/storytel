self.__WB_DISABLE_DEV_LOGS = true;

import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import CONFIG from '../scripts/config';
import logger from '../scripts/utils/logger';

// Skip waiting & claim clients immediately
self.skipWaiting();
self.clients.claim();

// Caching Halaman HTML (Network First)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'storytel-pages-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Caching Aset Statis (JS, CSS, Gambar, Font) (Network First)
registerRoute(
  ({ request, url }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css'),
  new NetworkFirst({
    cacheName: 'storytel-assets-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// Caching Respon API GET (Network First)
if (CONFIG.API_URL) {
  registerRoute(
    ({ url, request }) => request.method === 'GET' && url.href.includes(CONFIG.API_URL),
    new NetworkFirst({
      cacheName: 'storytel-api-cache',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        }),
      ],
    })
  );
}

// Push Notification Event Handler
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

// Notification Click Handler
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
