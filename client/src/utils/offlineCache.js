/* ═══════════════════════════════════════════════════════════════════════
   AIVA Offline Cache — IndexedDB storage + queue management
   ═══════════════════════════════════════════════════════════════════════ */

const DB_NAME = 'aiva-offline';
const DB_VERSION = 1;
const QUEUE_STORE = 'offlineQueue';
const CACHE_STORE = 'dataCache';

/**
 * Open IndexedDB
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        const store = db.createObjectStore(CACHE_STORE, { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/* ─── Offline Queue ─── */

/**
 * Add a request to the offline queue
 */
export async function addToQueue(item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readwrite');
    tx.objectStore(QUEUE_STORE).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get all queued requests
 */
export async function getQueue() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readonly');
    const req = tx.objectStore(QUEUE_STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Remove a request from the queue
 */
export async function removeFromQueue(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readwrite');
    tx.objectStore(QUEUE_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Process all queued requests (replay them)
 */
export async function processQueue(getToken) {
  const queue = await getQueue();
  const results = [];

  for (const item of queue) {
    try {
      const headers = { ...item.headers };
      // Refresh auth token for queued requests
      const token = getToken?.();
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(item.url, {
        method: item.method,
        headers,
        body: item.body || undefined,
      });

      if (response.ok) {
        await removeFromQueue(item.id);
        results.push({ id: item.id, success: true });
      } else {
        results.push({ id: item.id, success: false, status: response.status });
      }
    } catch (err) {
      results.push({ id: item.id, success: false, error: err.message });
    }
  }

  return results;
}

/* ─── Data Cache (IndexedDB) ─── */

/**
 * Cache data in IndexedDB for offline access
 */
export async function cacheData(key, data, ttlMinutes = 60) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CACHE_STORE, 'readwrite');
    tx.objectStore(CACHE_STORE).put({
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get cached data from IndexedDB
 */
export async function getCachedData(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CACHE_STORE, 'readonly');
    const req = tx.objectStore(CACHE_STORE).get(key);
    req.onsuccess = () => {
      const result = req.result;
      if (!result) return resolve(null);
      if (Date.now() > result.expiresAt) {
        // Expired — clean up and return null
        clearCachedData(key).catch(() => {});
        return resolve(null);
      }
      resolve(result.data);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Clear specific cached data
 */
export async function clearCachedData(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CACHE_STORE, 'readwrite');
    tx.objectStore(CACHE_STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Clear all expired cache entries
 */
export async function clearExpiredCache() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CACHE_STORE, 'readwrite');
    const store = tx.objectStore(CACHE_STORE);
    const req = store.openCursor();
    let removed = 0;

    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        if (Date.now() > cursor.value.expiresAt) {
          cursor.delete();
          removed++;
        }
        cursor.continue();
      }
    };
    tx.oncomplete = () => resolve(removed);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get queue size
 */
export async function getQueueSize() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readonly');
    const req = tx.objectStore(QUEUE_STORE).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
