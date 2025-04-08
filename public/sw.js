// Handle push event
self.addEventListener('push', event => {
  let data = { title: 'DailyPing', body: 'You have a new ping!' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      console.error('❌ Push data JSON parse error:', err);
      data.body = event.data?.text() || 'You have a new ping!';
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-72.png'
  };

  event.waitUntil(
    (async () => {
      // Show notification
      await self.registration.showNotification(data.title, options);

      // Also send message to all clients (to trigger sound)
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clientList.forEach(client => {
        client.postMessage({ action: 'play-ping-sound' });
      });
    })()
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  console.log('🔗 Notification click received.');
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          client.postMessage({ action: 'play-ping-sound' });
          return client.focus();
        }
      }
      return self.clients.openWindow('/dashboard');
    })
  );
});
