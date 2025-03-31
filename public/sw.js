self.addEventListener('push', event => {
  console.log('📨 Push event received:', event);

  let data = { title: 'DailyPing', body: 'You have a new ping!' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      console.error('❌ Push data JSON parse error:', err);
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-72.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
      .then(() => console.log('🔔 Notification shown:', data))
      .catch(err => console.error('❌ Notification show error:', err))
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
