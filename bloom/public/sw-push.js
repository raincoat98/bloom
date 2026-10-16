// Push Notification handler for Bloom PWA
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Bloom 🌸',
    body: '새로운 알림이 도착했어요.',
    url: '/',
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/pwa-192.png',
    badge: payload.badge || '/favicon.svg',
    tag: payload.tag || 'bloom-notification',
    data: {
      url: payload.url || '/',
      ...payload.data,
    },
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if ('focus' in client) {
            if ('navigate' in client && client.url !== urlToOpen) {
              client.navigate(urlToOpen);
            }
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      }),
  );
});
