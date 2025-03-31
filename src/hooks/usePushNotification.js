import { useEffect } from 'react';
import axios from 'axios';

export function usePushNotifications() {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return;
    }

    async function registerPush() {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service worker registered');

        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          console.log('🔁 Already subscribed');
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY)
        });

        const token = localStorage.getItem('token');
        await axios.post('https://api.dailyping.org/api/push/subscribe', subscription, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Push subscription sent to server');
      } catch (err) {
        console.error('❌ Push registration failed:', err.message);
      }
    }

    registerPush();
  }, []);
}

// Utility: convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
