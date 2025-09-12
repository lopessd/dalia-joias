const CACHE_NAME = 'dalia-joyas-v1'
const urlsToCache = [
  '/',
  '/admin/joias',
  '/admin/perfil',
  '/revendedor/joias',
  '/revendedor/perfil',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json'
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache opened')
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log('Service Worker: All files cached')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error)
      })
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Skip API upload requests - let them go directly to network
  if (event.request.url.includes('/api/upload') || 
      event.request.method === 'POST' || 
      event.request.method === 'PUT' || 
      event.request.method === 'DELETE') {
    return
  }

  // For navigation requests, try network first, fallback to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If we got a response, clone it and store it in cache
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone)
              })
          }
          return response
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request)
            .then((response) => {
              return response || caches.match('/')
            })
        })
    )
    return
  }

  // For other requests, try cache first, fallback to network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((response) => {
            // Don't cache if not successful
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response
            const responseToCache = response.clone()

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/')
        }
      })
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('Service Worker: Cache cleanup complete')
      return self.clients.claim()
    })
  )
})

// Handle background sync (for future use)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag)
})

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event)
})
