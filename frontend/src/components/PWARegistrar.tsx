'use client';

import { useEffect } from 'react';

export default function PWARegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const register = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered scope:', reg.scope);
          })
          .catch((err) => {
            console.error('[PWA] Service Worker registration failed:', err);
          });
      };

      if (document.readyState === 'complete') {
        register();
      } else {
        window.addEventListener('load', register);
        return () => window.removeEventListener('load', register);
      }
    }
  }, []);

  return null;
}
