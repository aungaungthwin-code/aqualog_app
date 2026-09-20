const CACHE_NAME = 'aqualog-cache-v5';
const urlsToCache = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './img/icon-192.png',
    './img/icon-512.png',
    './img/fish_pond.jpg',
    './img/myitchin_fish.jpg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

// Cache အဟောင်းများကို အလိုလို ဖျက်ပစ်ရန် ဤနေရာကို ထည့်သွင်းထားသည်
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Old cache deleted:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            return response || fetch(event.request);
        })
    );
});