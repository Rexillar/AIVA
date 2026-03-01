/* ═══════════════════════════════════════════════════════════════════════
   AIVA Service Worker — Offline-first caching + background sync
   ═══════════════════════════════════════════════════════════════════════ */

const CACHE_VERSION = 'aiva-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;
const OFFLINE_QUEUE_STORE = 'aiva-offline-queue';

// Static assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// API paths that should be cached for offline read access
const CACHEABLE_API_PATTERNS = [
  /^\/api\/tasks/,
  /^\/api\/notes/,
  /^\/api\/habits/,
  /^\/api\/workspaces/,
  /^\/api\/knowledge/,
  /^\/api\/templates/,
  /^\/api\/reminders/,
];

// API paths for write operations that should be queued offline
const QUEUEABLE_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

/* ─── Install ─── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

/* ─── Activate: clean old caches ─── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('aiva-') && key !== STATIC_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ─── Fetch: network-first for API, cache-first for static ─── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for caching (queue them if offline)
  if (QUEUEABLE_METHODS.includes(request.method) && url.pathname.startsWith('/api/')) {
    event.respondWith(handleMutationRequest(request));
    return;
  }

  // API GET requests — network first, fallback to cache
  if (url.pathname.startsWith('/api/') && request.method === 'GET') {
    const isCacheable = CACHEABLE_API_PATTERNS.some((p) => p.test(url.pathname));
    if (isCacheable) {
      event.respondWith(networkFirstWithCache(request, API_CACHE));
      return;
    }
    // Non-cacheable API: network only
    return;
  }

  // Static assets — cache first
  event.respondWith(cacheFirstWithNetwork(request, STATIC_CACHE));
});

/* ─── Strategy: network-first with cache fallback ─── */
async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ error: 'Offline', offline: true }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/* ─── Strategy: cache-first with network fallback ─── */
async function cacheFirstWithNetwork(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    return new Response('Offline', { status: 503 });
  }
}

/* ─── Queue mutation requests when offline ─── */
async function handleMutationRequest(request) {
  try {
    const response = await fetch(request.clone());
    return response;
  } catch {
    // Offline — queue the request for later sync
    const body = await request.text();
    const queueItem = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2),
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body,
      timestamp: Date.now(),
    };

    // Store in IndexedDB via message to client
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'OFFLINE_QUEUE_ADD',
        payload: queueItem,
      });
    });

    return new Response(
      JSON.stringify({
        success: true,
        offline: true,
        message: 'Request queued for sync when online',
        queueId: queueItem.id,
      }),
      { status: 202, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/* ─── Background Sync ─── */
self.addEventListener('sync', (event) => {
  if (event.tag === 'aiva-offline-sync') {
    event.waitUntil(processOfflineQueue());
  }
});

async function processOfflineQueue() {
  const clients = await self.clients.matchAll();
  // Ask client to process the queue (it has IndexedDB access)
  clients.forEach((client) => {
    client.postMessage({ type: 'PROCESS_OFFLINE_QUEUE' });
  });
}

/* ─── Push Notifications ─── */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'AIVA', {
      body: data.body || '',
      icon: '/assets/icon-192.png',
      badge: '/assets/icon-192.png',
      tag: data.tag || 'aiva-notification',
      data: data.url ? { url: data.url } : undefined,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((windowClients) => {
      const existing = windowClients.find((c) => c.url === url);
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});
