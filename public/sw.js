/**
 * Service Worker for Property Management PWA
 * 
 * Features:
 * - Offline functionality
 * - Background sync
 * - Push notifications
 * - Cache management
 * - Data synchronization
 */

const CACHE_NAME = 'property-management-v1';
const OFFLINE_CACHE = 'property-management-offline-v1';
const API_CACHE = 'property-management-api-v1';

// Files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/tenants',
  '/units',
  '/maintenance',
  '/payments',
  '/reports',
  '/manifest.json',
  '/offline.html'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/dashboard/stats',
  '/api/tenants',
  '/api/units',
  '/api/maintenance',
  '/api/payments'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE && cacheName !== API_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static assets
  if (request.destination === 'document' || request.destination === 'script' || request.destination === 'style') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// Handle API requests with offline support
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Network failed, trying cache:', url.pathname);
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline data or error
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This data is not available offline',
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Navigation failed, trying cache:', request.url);
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return caches.match('/offline.html');
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  try {
    // Try cache first for static assets
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Static asset failed:', request.url);
    
    // Return cached version or error
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Perform background sync
async function doBackgroundSync() {
  try {
    console.log('Starting background sync...');
    
    // Get pending offline data
    const pendingData = await getPendingOfflineData();
    
    if (pendingData.length === 0) {
      console.log('No pending data to sync');
      return;
    }
    
    console.log(`Syncing ${pendingData.length} pending items`);
    
    // Process each pending item
    for (const item of pendingData) {
      try {
        await syncOfflineItem(item);
        await removePendingItem(item.id);
        console.log('Synced item:', item.id);
      } catch (error) {
        console.error('Failed to sync item:', item.id, error);
      }
    }
    
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Get pending offline data from IndexedDB
async function getPendingOfflineData() {
  // This would typically read from IndexedDB
  // For now, return empty array
  return [];
}

// Sync individual offline item
async function syncOfflineItem(item) {
  const { type, data, endpoint } = item;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to sync ${type}: ${error.message}`);
  }
}

// Remove pending item after successful sync
async function removePendingItem(itemId) {
  // This would typically remove from IndexedDB
  console.log('Removing pending item:', itemId);
}

// Get authentication token
async function getAuthToken() {
  // This would typically get from secure storage
  return 'offline-token';
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  if (!event.data) {
    console.log('Push notification has no data');
    return;
  }
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  if (event.action) {
    console.log('Action clicked:', event.action);
    // Handle specific actions
    handleNotificationAction(event.action, event.notification.data);
  } else {
    // Default click behavior
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Handle notification actions
function handleNotificationAction(action, data) {
  switch (action) {
    case 'view':
      clients.openWindow(data.url || '/dashboard');
      break;
    case 'dismiss':
      // Just close the notification
      break;
    default:
      clients.openWindow('/dashboard');
  }
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CACHE_DATA':
      cacheOfflineData(data);
      break;
    case 'GET_CACHED_DATA':
      getCachedData(data.key).then(result => {
        event.ports[0].postMessage({ success: true, data: result });
      }).catch(error => {
        event.ports[0].postMessage({ success: false, error: error.message });
      });
      break;
    default:
      console.log('Unknown message type:', type);
  }
});

// Cache offline data
async function cacheOfflineData(data) {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    await cache.put(data.key, new Response(JSON.stringify(data.value)));
    console.log('Data cached for offline use:', data.key);
  } catch (error) {
    console.error('Failed to cache offline data:', error);
  }
}

// Get cached data
async function getCachedData(key) {
  try {
    const cache = await caches.open(OFFLINE_CACHE);
    const response = await cache.match(key);
    
    if (response) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get cached data:', error);
    throw error;
  }
}

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-sync') {
      event.waitUntil(doBackgroundSync());
    }
  });
}

console.log('Service Worker loaded successfully');
