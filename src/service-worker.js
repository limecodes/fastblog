const CACHE_NAME = 'v2'
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/posts.html',
  '/audio.html',
  '/css/reset.css',
  '/css/main.css',
  '/css/posts.css',
  '/css/audio.css',
  '/js/components/Post.js',
  '/js/components/PostsList.js',
  '/js/components/Users.js',
  '/js/controller/usePosts.js',
  '/js/controller/useUsers.js',
  '/js/lib/cache.js',
  '/js/lib/createState.js',
  '/js/lib/fetchPaginated.js',
  '/js/lib/getUrl.js',
  '/js/audio.js',
  '/js/posts.js',
  '/audio/new-wave-kit.ogg',
  '/audio/synth-organ.ogg',
]

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE)))
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response

      return fetch(event.request)
    }),
  )
})
