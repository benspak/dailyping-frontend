// sw.js
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

// Optional: open dashboard and play sound
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        // Focus the tab if it's already open
        if (client.url.includes('/dashboard') && 'focus' in client) {
          client.postMessage({ action: 'play-ping-sound' });
          return client.focus();
        }
      }

      // Otherwise open a new tab
      return clients.openWindow('/dashboard');
    })
  );
});

self.addEventListener("push", function (event) {
  // Example: send a message to all open clients (tabs)
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ action: "play-ping-sound" });
      });
    })
  );
});


// Optional: Handle notification click event
self.addEventListener('notificationclick', event => {
  console.log('🔗 Notification click received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('https://dailyping.org/dashboard')
  );
});
