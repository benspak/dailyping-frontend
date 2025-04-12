// sw.js

// Handle push: just show notification (no autoplay here)
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
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes('/goals') && 'focus' in client) {
          // Send message to play sound if goals is already open
          client.postMessage({ action: 'play-ping-sound' });
          return client.focus();
        }
      }

      // Otherwise open new tab and let frontend play sound on load
      return self.clients.openWindow('/goals?ping=1');
    })
  );
});
