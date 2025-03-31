// utils/registerPush.js
import axios from 'axios';

export async function registerPush() {
  if (!('serviceWorker' in navigator)) {
    console.warn('🚫 Service workers not supported in this browser.');
    return;
  }

  if (!('PushManager' in window)) {
    console.warn('🚫 Push API not supported in this browser.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('📦 Service worker registered');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('🔕 Push permission denied');
      return;
    }

    const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('❌ Missing REACT_APP_VAPID_PUBLIC_KEY');
      return;
    }

    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey
    });

    // console.log('🔐 subscription:', subscription);

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No auth token, cannot send subscription to server.');
      return;
    }

    await axios.post('https://api.dailyping.org/api/push/subscribe', { subscription }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // console.log('📬 Subscription sent to server');

  } catch (err) {
    console.error('❌ Push registration failed:', err.message);
  }
}

// Utility to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
