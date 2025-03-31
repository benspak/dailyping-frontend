self.addEventListener('push', (event) => {
  const data = event.data.json();

  const options = {
    body: data.body || '',
    icon: '/logo192.png',
    badge: '/favicon.ico'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'DailyPing', options)
  );
});
