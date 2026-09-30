// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDkyKZ_41gbopbFnwtPWDrlTLDt2b3go5Q",
  projectId: "lunar-axiom-qxctm",
  messagingSenderId: "685309193604",
  appId: "1:685309193604:web:e803fc54252e832b8401d1"
};

firebase.initializeApp(firebaseConfig);

let messaging;
try {
  messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification?.title || payload.data?.title || 'Civic Complaint Status Updated';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'Your reported complaint status has been updated by civic authorities.',
      icon: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=128&q=80',
      badge: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=128&q=80',
      data: payload.data,
      vibrate: [200, 100, 200]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.warn('FCM Service worker messaging initialization warning:', e);
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
