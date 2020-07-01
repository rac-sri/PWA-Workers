const cacheName = "site-static";
const assets = [
  "/",
  "/index.html",
  "/js/app.js",
  "/js/ui.js",
  "/js/materialize.min.js",
  "/css/styles.css",
  "/css/materialize.min.css",
  "/img/dish.png",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2",
  "/pages/fallback.html",
];

self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(cacheName).then((cache) => {
      caches.addAll(assets);
    })
  );
});

self.addEventListener("activate", (evt) => {
  console.log("Activated");

  evt.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key != cacheName).map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener("fetch", (evt) => {
  console.log("fetching");

  evt.respondWith(
    caches.match(evt.request).then((cache) => {
      return cache || fetch(evt.request);
    })
  );
});
