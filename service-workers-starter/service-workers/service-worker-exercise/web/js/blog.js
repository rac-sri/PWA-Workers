(function Blog() {
  "use strict";

  var offlineIcon;
  var isOnline = "onLine" in navigator ? navigator.onLine : true; // feature detection
  var isLoggedIn = /isLoggedIn=1/.test(document.cookie.toString() || "");
  var usingSW = "serviceWorker" in navigator;
  var swRegistration;
  var svcworker;
  document.addEventListener("DOMContentLoaded", ready, false);

  initServiceWorker().catch(console.error);

  function ready() {
    console.log(isOnline);
    offlineIcon = document.getElementById("connectivity-status");
    if (!isOnline) {
      offlineIcon.classList.remove("hidden");
    }
    window.addEventListener("online", function online() {
      console.log("online");
      offlineIcon.classList.add("hidden");
      isOnline = true;
      sendStatusUpdate();
    });

    window.addEventListener("offline", function offline() {
      offlineIcon.classList.remove("hidden");
      isOnline = false;
      sendStatusUpdate();
    });
  }

  async function initServiceWorker() {
    // startup and install the service worker
    swRegistration = await navigator.serviceWorker.register("/sw.js", {
      // doing this cause we want service worker to handle the entire document route
      updateViaCache: "none", // url redirect setup is already done on the backend
    });

    svcworker =
      swRegistration.installing ||
      swRegistration.waiting ||
      swRegistration.active;
    // waiting basically means wait for a predeccer service worker to die out

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      function onControl() {
        svcworker = navigator.serviceWorker.controller;
        sendStatusUpdate(svcworker);
      }
    );

    navigator.serviceWorker.controller.addEventListener("message", onSWMessage);
  }

  function onSWMessage(evt) {
    var { data } = evt;
    if (data.requestStatusUpdate) {
      console.log("Recieved status update");
      sendStatusUpdate(evt.ports && evt.ports[0]); // port here decides the port for communication with sworker
    }
  }
  function sendStatusUpdate(target) {
    sendSWMessage({ statusUpdate: { isOnline, isLoggedIn } }, target);
  }
  async function sendSWMessage(msg, target) {
    if (target) {
      target.postMessage(msg);
    } else if (svcworker) {
      svcworker.postMessage(msg);
    } else {
      navigator.serviceWorker.controller.postMessage(msg);
    }
  }
})();
