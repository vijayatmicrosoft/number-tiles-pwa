const CACHE_NAME = 'numtiles-v3';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/reset.css',
  './css/variables.css',
  './css/layout.css',
  './css/grid.css',
  './css/tiles.css',
  './css/modals.css',
  './js/app.js',
  './js/storage.js',
  './js/game/board.js',
  './js/game/rules.js',
  './js/game/state.js',
  './js/game/levels.js',
  './js/ui/renderer.js',
  './js/ui/animations.js',
  './js/ui/hud.js',
  './js/ui/modals.js',
  './js/systems/score.js',
  './js/systems/boosters.js',
  './js/systems/audio.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/screenshots/mobile.png',
  './assets/screenshots/desktop.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
