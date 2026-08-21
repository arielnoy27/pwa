// A name for our cache. If we update the app, we change this to 'calc-v2'
const CACHE_NAME = 'calc-v1';

// The exact files we want to save to the user's device
const ASSETS_TO_CACHE = [
    '/', // Caches the root directory
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json'
];

// 1. INSTALL EVENT: Triggered the first time the user visits the page
self.addEventListener('install', (event) => {
    // Wait until the caching is finished before completing the install
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache and saving assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. ACTIVATE EVENT: Triggered when the service worker takes control
self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
});

// 3. FETCH EVENT: Intercepting network requests
self.addEventListener('fetch', (event) => {
    event.respondWith(
        // Check if the requested file is already in our cache
        caches.match(event.request).then((cachedResponse) => {
            // If it is, return the cached version. If not, fetch it from the internet.
            return cachedResponse || fetch(event.request);
        })
    );
});