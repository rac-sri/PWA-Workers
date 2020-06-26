"use strict";

const version = 2;

var isOnline = true;
var isLoggedIn = false;

self.addEventListener("install", onInstall);
self.addEventListener("activate", onActivate);
self.addEventListener("message", onMessage);

main().catch(console.error);

async function main() {
  console.log(`Service worker ${version} has started`);
  await sendMessage({ requestStatusUpdate: true });
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

async function handleActivation() {
  // is service worker changes, the page still might know that the worker changed
  // tell page that hey I am controlling you now

  await clients.claim(); // find all my clients
  console.log(`Service Worker ${version} activated`);
}
