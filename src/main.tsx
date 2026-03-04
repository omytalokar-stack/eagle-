import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register service worker for PWA and push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('✅ Service Worker registered:', reg.scope);
      // Request notification permission for push
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('✅ Notification permission granted');
          }
        });
      }
    }).catch(err => console.warn('⚠️ Service Worker registration failed:', err));
  });
}

// Capture beforeinstallprompt for install prompt on demand
let deferredPrompt: any = null;
window.addEventListener('beforeinstallprompt', (e: any) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('✅ beforeinstallprompt captured - app is installable');
});

// Handle successful install
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA installed successfully');
  deferredPrompt = null;
});

// Make deferredPrompt globally available if you want to trigger install manually
(window as any).deferredPrompt = deferredPrompt;
