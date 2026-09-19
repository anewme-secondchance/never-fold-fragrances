const CACHE_NAME = "never-fold-v2";

const APP_FILES = [
  "./",
  "./index.html",
   "./trial-agreement.html",
  "./styles.css",
  "./script.js",
  "./manifest.json",
  "./scents.html",
  "./vault.html",
  "./refills.html",
  "./extras.html",
  "./cart.html",
  "./checkout.html",
  "./contact.html",
  "./receipt.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
