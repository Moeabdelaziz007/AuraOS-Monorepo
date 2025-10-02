// SelfOS Service Worker
// Provides offline functionality and caching for the SelfOS PWA

const CACHE_NAME = 'selfos-v1.0.0';
const STATIC_CACHE_NAME = 'selfos-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'selfos-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/home.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/assets/index.css',
  '/assets/index.js',
  '/assets/vendor.js',
  '/assets/ui.js',
  '/assets/networking.js'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/emulator/,
  /\/api\/bridge/,
  /\/api\/ai/,
  /\/api\/settings/
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('SelfOS Service Worker: Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('SelfOS Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('SelfOS Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('SelfOS Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SelfOS Service Worker: Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME &&
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('SelfOS Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SelfOS Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (isStaticFile(request)) {
    event.respondWith(handleStaticFile(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Check if request is for a static file
function isStaticFile(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/assets/') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.svg') ||
         url.pathname.endsWith('.ico');
}

// Check if request is for API
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') ||
         API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Handle static file requests
async function handleStaticFile(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fetch from network
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('SelfOS Service Worker: Static file fetch failed', error);

    // Return offline page for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/index.html');
    }

    throw error;
  }
}

// Handle API requests
async function handleAPIRequest(request) {
  try {
    // Try network first for API requests
    const networkResponse = await fetch(request);

    // Cache successful API responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('SelfOS Service Worker: API request failed', error);

    // Try cache for offline API requests
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response for API requests
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'SelfOS is currently offline. Some features may be limited.',
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// Handle dynamic requests (HTML pages)
async function handleDynamicRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('SelfOS Service Worker: Dynamic request failed', error);

    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    return caches.match('/index.html');
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('SelfOS Service Worker: Background sync triggered', event.tag);

  if (event.tag === 'selfos-sync') {
    event.waitUntil(performBackgroundSync());
  }
});

// Perform background synchronization
async function performBackgroundSync() {
  try {
    console.log('SelfOS Service Worker: Performing background sync');

    // Sync offline actions when back online
    const offlineActions = await getOfflineActions();

    for (const action of offlineActions) {
      try {
        await syncOfflineAction(action);
        await removeOfflineAction(action.id);
      } catch (error) {
        console.error('SelfOS Service Worker: Failed to sync action', action.id, error);
      }
    }

    console.log('SelfOS Service Worker: Background sync complete');
  } catch (error) {
    console.error('SelfOS Service Worker: Background sync failed', error);
  }
}

// Get offline actions from IndexedDB
async function getOfflineActions() {
  // This would typically use IndexedDB to store offline actions
  // For now, return empty array
  return [];
}

// Sync individual offline action
async function syncOfflineAction(action) {
  const response = await fetch(action.url, {
    method: action.method,
    headers: action.headers,
    body: action.body
  });

  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }

  return response;
}

// Remove synced offline action
async function removeOfflineAction(actionId) {
  // Remove from IndexedDB
  console.log('SelfOS Service Worker: Removed offline action', actionId);
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('SelfOS Service Worker: Push notification received');

  const options = {
    body: 'SelfOS has new updates available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore SelfOS',
        icon: '/icons/action-explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/action-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SelfOS Update', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('SelfOS Service Worker: Notification clicked', event.action);

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('SelfOS Service Worker: Message received', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE_NAME)
        .then((cache) => {
          return cache.addAll(event.data.urls);
        })
    );
  }
});

console.log('SelfOS Service Worker: Loaded successfully');
