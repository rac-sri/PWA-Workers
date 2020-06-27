"use strict";

const version = 5;

var isOnline = true;
var isLoggedIn = false;
var cacheName = `ramblings-${version}`;

var urlsToCache = {
  loggedOut: [
    "/",
    "/about",
    "/contact",
    "/404",
    "/login",
    "/offline",
    "/css/style.css",
    "/js/blog.js",
    "/js/home.js",
    "/js/login.js",
    "/js/add-post.js",
    "/js/external/idb-keyval-iife.min.js",
    "/images/logo.gif",
    "/images/offline.png",
  ],
};

self.addEventListener("install", onInstall);
self.addEventListener("activate", onActivate);
self.addEventListener("message", onMessage);
self.addEventListener("fetch", onFetch);

main().catch(console.error);

async function main() {
  console.log(`Service worker ${version} has started`);
  await sendMessage({ requestStatusUpdate: true });
  await cacheLoggedOutFiles();
}

async function sendMessage(msg) {
  var allClients = await clients.matchAll({ includeUncontrolled: true });
  return Promise.all(
    allClients.map(function clientMsg(client) {
      var chan = new MessageChannel();
      chan.port1.onmessage = onMessage; // listen on port1 and send on port2
      return client.postMessage(msg, [chan.port2]);
    })
  );
}

function onMessage({ data }) {
  if (data.statusUpdate) {
    ({ isOnline, isLoggedIn } = data.statusUpdate);
    console.log(
      `Service worker (v${version}) status update, isOnline: ${isOnline} , isLoggedInt: ${isLoggedIn}`
    );
  }
}

async function onInstall(evt) {
  console.log(`Service Worker ${version} installed`);
  self.skipWaiting();
}

function onActivate(evt) {
  // tell browser I am still doing important stuff, dont shut me down please ( though not gauranteed)
  evt.waitUntil(handleActivation());
}

function onFetch(evt) {
  evt.respondWith(router(evt.request));
}

async function router(req) {
  var url = new URL(req.url);
  var reqURL = url.pathname;
  var cache = await caches.open(cacheName);
  let res;
  if (url.origin == location.origin) {
    try {
      let fetchOptions = {
        method: req.method,
        headers: req.headers,
        credentials: "omit",
        cache: "no-store",
      };

      res = await fetch(reqURL, fetchOptions);
      if (res && res.ok) {
        // cache if successful res
        await cache.put(reqURL, res.clone());
        return res;
      }
    } catch (err) {
      // failed to get it from server so now check the cache
      res = await cache.match(reqURL);
      if (res) {
        return res.clone();
      }
    }
  }
}

async function handleActivation() {
  await clearCaches(); // clear old caches

  // is service worker changes, the page still might know that the worker changed
  // tell page that hey I am controlling you now

  await clients.claim(); // find all my clients
  await cacheLoggedOutFiles(/*forceReload=*/ true);
  console.log(`Service Worker ${version} activated`);
}

async function clearCaches() {
  var cacheNames = await caches.keys();
  var oldCacheNames = cacheNames.filter(function matchOldCache(cacheName) {
    if (/^ramblings-\d+$/.test(cacheName)) {
      let [, cacheVersion] = cacheName.match(/^ramblings-\d+$/);
      cacheVersion = cacheVersion != null ? Number(cacheVersion) : cacheVersion;
      return cacheVersion > 0 && cacheVersion != version; // dump only if the version is the same
    }
  });

  return Promise.all(
    oldCacheNames.map(function deleteCache(cacheName) {
      return caches.delete(cacheName);
    })
  );
}
async function cacheLoggedOutFiles(forceReload = false) {
  var cache = await caches.open(cacheName);
  return Promise.all(
    urlsToCache.loggedOut.map(async function cacheFile(url) {
      try {
        let res;
        if (!forceReload) {
          res = await cache.match(url);
          if (res) {
            return res;
          }
        }
        let fetchOptions = {
          method: "GET",
          cache: "no-cache", // tell the browser layer not to store the result in the intermediate cache, we need new data
          credentials: "omit",
        };

        res = await fetch(url, fetchOptions);
        if (res.ok) {
          await cache.put(url, res); // mostly you will use res.clone , but we are not using clone since we dont need that since we are making req from service worker not from browser so we dont need it
        }
      } catch (err) {}
    })
  );
}
