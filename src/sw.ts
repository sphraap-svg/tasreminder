/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<unknown> };

const ICON = '/tasreminder/icons/icon-192.png';

// ── Lifecycle ─────────────────────────────────────────────────────────────────
self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// ── Web Push: show a notification even when the app is fully closed ────────────
self.addEventListener('push', (event: PushEvent) => {
  let payload: any = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'Reminder it', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'Reminder it';
  const options: NotificationOptions = {
    body: payload.body || '',
    icon: payload.icon || ICON,
    badge: ICON,
    tag: payload.tag,
    data: { url: payload.url || '/tasreminder/' },
    requireInteraction: !!payload.requireInteraction,
    // @ts-ignore — supported on most engines, ignored elsewhere
    dir: 'rtl',
    // @ts-ignore
    vibrate: payload.urgent ? [200, 100, 200] : undefined,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Open / focus the app when a notification is tapped ─────────────────────────
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/tasreminder/';
  event.waitUntil(
    (async () => {
      const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const c of wins) {
        if ('focus' in c) { await (c as WindowClient).focus(); return; }
      }
      if (self.clients.openWindow) await self.clients.openWindow(target);
    })()
  );
});
