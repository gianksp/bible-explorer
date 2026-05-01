const CACHE_NAME = 'bible-explorer-v1'
const STATIC_ASSETS = [
    '/',
    '/index.html',
]

// Install — cache static shell
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
    )
    self.skipWaiting()
})

// Activate — delete old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    )
    self.clients.claim()
})

// Fetch — cache first for static, network first for API
self.addEventListener('fetch', event => {
    const { request } = event
    const url = new URL(request.url)

    // Skip non-GET and browser-extension requests
    if (request.method !== 'GET') return
    if (!url.protocol.startsWith('http')) return

    // API calls — network first, no cache
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(fetch(request))
        return
    }

    // Everything else — cache first, fallback to network then cache shell
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse

            return fetch(request)
                .then(networkResponse => {
                    // Cache successful responses
                    if (networkResponse.ok) {
                        const responseClone = networkResponse.clone()
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, responseClone)
                        })
                    }
                    return networkResponse
                })
                .catch(() => {
                    // Offline fallback — return app shell for navigation requests
                    if (request.destination === 'document') {
                        return caches.match('/')
                    }
                })
        })
    )
})