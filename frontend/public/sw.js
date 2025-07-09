// Service Worker for NocturneSwap PWA
// Enables offline functionality and caching

const CACHE_NAME = 'nocturne-swap-v1.0.0';
const STATIC_CACHE_NAME = 'nocturne-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'nocturne-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/src/jupiter-integration.js',
  '/src/solana-rpc.js',
  '/src/wallet-integration.js',
  '/src/cult-theme.css',
  '/src/analytics.js',
  '/src/api.js',
  '/manifest.json',
  'https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js'
];

// API endpoints to cache
const API_ENDPOINTS = [
  'https://api.coingecko.com/api/v3/simple/price',
  'https://quote-api.jup.ag/v6/quote',
  'https://api.mainnet-beta.solana.com'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('🌙 NocturneSwap Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Static files cached successfully');
        self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🌙 NocturneSwap Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method === 'GET') {
    if (isStaticFile(url)) {
      event.respondWith(handleStaticFile(request));
    } else if (isAPIRequest(url)) {
      event.respondWith(handleAPIRequest(request));
    } else {
      event.respondWith(handleDynamicRequest(request));
    }
  }
});

// Handle static file requests
function handleStaticFile(request) {
  return caches.match(request)
    .then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Return offline fallback for HTML requests
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
    });
}

// Handle API requests with caching strategy
function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  // Use cache-first strategy for price data (with short TTL)
  if (url.pathname.includes('/price')) {
    return caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          const cachedTime = new Date(cachedResponse.headers.get('cached-time') || 0);
          const now = new Date();
          
          // Use cached data if less than 30 seconds old
          if (now - cachedTime < 30000) {
            return cachedResponse;
          }
        }
        
        return fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              const responseWithTime = new Response(responseClone.body, {
                ...responseClone,
                headers: {
                  ...responseClone.headers,
                  'cached-time': new Date().toISOString()
                }
              });
              
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseWithTime);
                });
            }
            return response;
          })
          .catch(() => {
            // Return cached data if network fails
            return cachedResponse || new Response('{"error": "Network unavailable"}', {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
      });
  }
  
  // Network-first strategy for other API requests
  return fetch(request)
    .then((response) => {
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE_NAME)
          .then((cache) => {
            cache.put(request, responseClone);
          });
      }
      return response;
    })
    .catch(() => {
      return caches.match(request);
    });
}

// Handle dynamic requests
function handleDynamicRequest(request) {
  return fetch(request)
    .then((response) => {
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE_NAME)
          .then((cache) => {
            cache.put(request, responseClone);
          });
      }
      return response;
    })
    .catch(() => {
      return caches.match(request);
    });
}

// Utility functions
function isStaticFile(url) {
  const staticExtensions = ['.js', '.css', '.html', '.json', '.png', '.jpg', '.svg', '.ico'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) || url.pathname === '/';
}

function isAPIRequest(url) {
  const apiDomains = ['api.coingecko.com', 'quote-api.jup.ag', 'api.mainnet-beta.solana.com'];
  return apiDomains.some(domain => url.hostname.includes(domain));
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 'default'
      },
      actions: [
        {
          action: 'open',
          title: 'Open NocturneSwap',
          icon: '/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Dismiss',
          icon: '/icon-192x192.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'NocturneSwap', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      doBackgroundSync()
    );
  }
});

async function doBackgroundSync() {
  try {
    // Sync offline transactions or data
    console.log('🔄 Performing background sync...');
    
    // Get pending transactions from IndexedDB
    const pendingTransactions = await getPendingTransactions();
    
    for (const transaction of pendingTransactions) {
      try {
        await syncTransaction(transaction);
        await removePendingTransaction(transaction.id);
      } catch (error) {
        console.error('❌ Failed to sync transaction:', error);
      }
    }
    
    console.log('✅ Background sync completed');
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// IndexedDB utilities (placeholder implementations)
async function getPendingTransactions() {
  // Implementation would interact with IndexedDB
  return [];
}

async function syncTransaction(transaction) {
  // Implementation would sync transaction with network
  return true;
}

async function removePendingTransaction(id) {
  // Implementation would remove from IndexedDB
  return true;
}

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'price-sync') {
    event.waitUntil(
      syncPrices()
    );
  }
});

async function syncPrices() {
  try {
    console.log('💰 Syncing prices in background...');
    
    // Fetch latest prices
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin&vs_currencies=usd');
    const prices = await response.json();
    
    // Cache the prices
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    await cache.put('latest-prices', new Response(JSON.stringify(prices)));
    
    console.log('✅ Prices synced successfully');
  } catch (error) {
    console.error('❌ Failed to sync prices:', error);
  }
}

// Handle share target
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.searchParams.has('title') || url.searchParams.has('text') || url.searchParams.has('url')) {
    event.respondWith(handleShareTarget(event.request));
  }
});

async function handleShareTarget(request) {
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || '';
  const text = url.searchParams.get('text') || '';
  const sharedUrl = url.searchParams.get('url') || '';
  
  // Process shared content
  console.log('📤 Handling shared content:', { title, text, sharedUrl });
  
  // Redirect to main app with shared data
  return Response.redirect(`/?shared=true&title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}&url=${encodeURIComponent(sharedUrl)}`);
}

console.log('🌙 NocturneSwap Service Worker loaded');
