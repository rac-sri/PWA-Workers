const cacheName = "site-static-v2";
const dynamiCache = "site-dynamic-1";
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
  //console.log('service worker installed');
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log("caching shell assets");
      cache.addAll(assets);
    })
  );
});

self.addEventListener("activate", (evt) => {
  console.log("Activated");

  evt.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== cacheName && key !== dynamiCache)
          .map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener("fetch", (evt) => {
  console.log("fetching");

  evt.respondWith(
    caches.match(evt.request).then((cache) => {
      return (
        cache ||
        fetch(evt.request)
          .then((fetches) => {
            return caches.open(dynamiCache).then((cache) => {
              cache.put(evt.request.url, fetches.clone());
              return fetches;
            });
          })
          .catch(() => {
            if (evt.request.url.indexOf(".html") > -1)
              caches.match("/pages/fallback.html");
          })
      );
    })
  );
});
