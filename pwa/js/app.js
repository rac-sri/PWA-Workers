if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(() => console.log("registerd"))
    .catch(() => console.error("not regisfter"));
}
