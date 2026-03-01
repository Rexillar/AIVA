/* ═══════════════════════════════════════════════════════════════════════
   AIVA Service Worker Registration
   ═══════════════════════════════════════════════════════════════════════ */

import { addToQueue, processQueue } from './offlineCache';

let swRegistration = null;

/**
 * Register the service worker and set up offline queue listeners
 */
export async function registerServiceWorker(getToken) {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported');
    return null;
  }

  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('AIVA Service Worker registered:', swRegistration.scope);

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', async (event) => {
      const { type, payload } = event.data;

      if (type === 'OFFLINE_QUEUE_ADD') {
        await addToQueue(payload);
        console.log('Queued offline request:', payload.url);
      }

      if (type === 'PROCESS_OFFLINE_QUEUE') {
        const results = await processQueue(getToken);
        console.log('Processed offline queue:', results);
      }
    });

    // When we come back online, process queued requests
    window.addEventListener('online', async () => {
      console.log('Back online — processing offline queue...');
      const results = await processQueue(getToken);
      console.log('Online sync results:', results);

      // Request background sync if available
      if (swRegistration?.sync) {
        try {
          await swRegistration.sync.register('aiva-offline-sync');
        } catch {
          // Background sync not supported
        }
      }
    });

    return swRegistration;
  } catch (error) {
    console.error('SW registration failed:', error);
    return null;
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker() {
  if (swRegistration) {
    return swRegistration.unregister();
  }
  return false;
}

/**
 * Check if app is running as installed PWA
 */
export function isInstalledPWA() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}
