"use strict";

var curFib = 0;

self.postMessage("Hello from the web worker");
self.onmessage = onMessage;
// **********************************

function onMessage(evt) {
  getNextFib();
}

function getNextFib() {
  var fibNum = fib(curFib);
  self.postMessage({ fib: fibNum, idx: curFib });
  curFib++;
  setTimeout(getNextFib(), 0);
}

function fib(n) {
  if (n < 2) {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}
