// Service Worker for PWA capabilities
const CACHE_NAME = "aura-focus-v1"
const urlsToCache = [
  "/",
  "/index.html",
  "/styles/main.css",
  "/styles/themes.css",
  "/styles/components.css",
  "/js/app.js",
  "/js/database.js",
  "/js/utils.js",
  "/js/components/dashboard.js",
  "/js/components/calendar.js",
  "/js/components/tasks.js",
  "/js/components/habits.js",
  "/js/components/goals.js",
  "/js/components/notes.js",
  "/js/components/journal.js",
  "/js/components/focus-timer.js",
  "/js/components/settings.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})
