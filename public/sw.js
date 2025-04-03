self.addEventListener('push', event => {
  console.log('📨 Push event received:', event);

  let data = {
    title: 'DailyPing',
    body: 'You have a new ping!'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data.title = parsed.title || data.title;
      data.body = parsed.body || data.body;
    } catch (err) {
      console.error('❌ Push data parse error:', err);
      const fallback = event.data.text();
      data.body = typeof fallback === 'string' ? fallback : 'You have a new ping!';
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


// Optional: Handle notification click event
self.addEventListener('notificationclick', event => {
  console.log('🔗 Notification click received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('https://dailyping.org/dashboard')
  );
});
