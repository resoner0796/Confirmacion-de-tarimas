const CACHE_NAME = 'tarimas-cache-v1';
// Lista de archivos para cachear (el "App Shell")
const FILES_TO_CACHE = [
  'index.html',
  'manifest.json',
  'icon-192x192.PNG',
  'icon-512x512.PNG',
  // Cacheamos los scripts de Firebase para que inicie offline
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js'
];

// Evento 'install': Se dispara cuando el SW se instala
self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Instalando...');
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Cacheando el App Shell');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Evento 'activate': Se dispara cuando el SW se activa (limpia caches viejos)
self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activando...');
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Eliminando cache viejo', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Evento 'fetch': Intercepta todas las peticiones de red
self.addEventListener('fetch', (evt) => {
  // Estrategia: Cache-First (primero busca en cache, si no, va a la red)
  // Esto es ideal para el App Shell
  evt.respondWith(
    caches.match(evt.request).then((response) => {
      // Si la respuesta está en el cache, la regresa
      // Si no, la busca en la red
      return response || fetch(evt.request);
    })
  );
});