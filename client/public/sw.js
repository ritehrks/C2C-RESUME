/// <reference lib="webworker" />

const CACHE_VERSION = 'v2';
const STATIC_CACHE = `c2c-static-${CACHE_VERSION}`;
const PAGES_CACHE = `c2c-pages-${CACHE_VERSION}`;
const IMAGES_CACHE = `c2c-images-${CACHE_VERSION}`;

// Critical assets to pre-cache on install
const PRECACHE_ASSETS = [
    '/',
    '/courses',
    '/attendance',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/favicon.png',
    '/logo-v2.png',
];

// Install — pre-cache critical shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate — clean up old versioned caches
self.addEventListener('activate', (event) => {
    const currentCaches = [STATIC_CACHE, PAGES_CACHE, IMAGES_CACHE];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => !currentCaches.includes(name))
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Helper: is this a Next.js static asset? (_next/static/...)
function isStaticAsset(url) {
    return url.includes('/_next/static/') ||
        url.includes('/icons/') ||
        url.endsWith('.png') ||
        url.endsWith('.jpg') ||
        url.endsWith('.svg') ||
        url.endsWith('.woff2') ||
        url.endsWith('.woff') ||
        url.endsWith('.css');
}

// Helper: is this an HTML page navigation?
function isPageNavigation(request) {
    return request.mode === 'navigate' ||
        (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

self.addEventListener('fetch', (event) => {
    // Skip non-GET
    if (event.request.method !== 'GET') return;

    // Skip API calls — always go to network for fresh data
    if (event.request.url.includes('/api/')) return;

    // Skip non-http(s)
    if (!event.request.url.startsWith('http')) return;

    const url = event.request.url;

    // Strategy 1: CACHE-FIRST for static assets (JS chunks, CSS, images, fonts)
    // These are content-hashed by Next.js, so safe to serve from cache
    if (isStaticAsset(url)) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached;
                return fetch(event.request).then((response) => {
                    if (response.status === 200) {
                        const clone = response.clone();
                        const cacheName = url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.svg')
                            ? IMAGES_CACHE
                            : STATIC_CACHE;
                        caches.open(cacheName).then((cache) => cache.put(event.request, clone));
                    }
                    return response;
                }).catch(() => new Response('', { status: 503 }));
            })
        );
        return;
    }

    // Strategy 2: STALE-WHILE-REVALIDATE for page navigations
    // Serve cached page instantly, update cache in background
    if (isPageNavigation(event.request)) {
        event.respondWith(
            caches.open(PAGES_CACHE).then((cache) => {
                return cache.match(event.request).then((cached) => {
                    const fetchPromise = fetch(event.request).then((response) => {
                        if (response.status === 200) {
                            cache.put(event.request, response.clone());
                        }
                        return response;
                    }).catch(() => {
                        // If offline and no cache, return a basic offline response
                        return cached || new Response(
                            '<html><body><h1>Offline</h1><p>Please check your connection.</p></body></html>',
                            { status: 503, headers: { 'Content-Type': 'text/html' } }
                        );
                    });

                    // Return cached immediately if available, otherwise wait for network
                    return cached || fetchPromise;
                });
            })
        );
        return;
    }

    // Strategy 3: NETWORK-FIRST for everything else (data fetches, etc.)
    event.respondWith(
        fetch(event.request).then((response) => {
            if (response.status === 200) {
                const clone = response.clone();
                caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
            }
            return response;
        }).catch(() => {
            return caches.match(event.request).then((cached) => {
                return cached || new Response('Offline', { status: 503 });
            });
        })
    );
});
