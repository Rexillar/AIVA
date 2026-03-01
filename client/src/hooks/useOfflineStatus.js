import { useState, useEffect, useCallback } from 'react';
import { getQueueSize, processQueue } from '../utils/offlineCache';

/**
 * Hook for offline status awareness and queue management
 *
 * Usage:
 *   const { isOnline, pendingCount, syncNow } = useOfflineStatus(getToken);
 */
export default function useOfflineStatus(getToken) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Poll pending queue count
  useEffect(() => {
    const check = async () => {
      try {
        const count = await getQueueSize();
        setPendingCount(count);
      } catch {
        // IndexedDB not available
      }
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  const syncNow = useCallback(async () => {
    if (!isOnline) return [];
    const results = await processQueue(getToken);
    const count = await getQueueSize();
    setPendingCount(count);
    return results;
  }, [isOnline, getToken]);

  return { isOnline, pendingCount, syncNow };
}
