importScripts('/scram/scramjet.all.js');

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

// 1. FIX: Claim clients immediately (Solves "Works on reload but not first time")
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 2. Main Fetch Handler
self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url); // Use URL object for safer parsing

  // 🔴 HARD BYPASS — do NOT touch non-http/https
  if (
    !req.url.startsWith("http://") &&
    !req.url.startsWith("https://")
  ) return;

  // 🔴 Adblock / Tracker Bypass
  if (
    url.hostname.includes("googlesyndication.com") ||
    url.hostname.includes("doubleclick.net") ||
    url.hostname.includes("googleadservices.com") ||
    url.hostname.includes("adtrafficquality.google")
  ) {
    return; // let browser handle it (or block it naturally)
  }

  // 🔴 Already proxied or internal — DO NOT rewrap
  // (Prevents infinite loops if scramjet calls itself)
  if (url.pathname.includes("/scramjet/")) {
    return;
  }

  // 🔴 TMDB Bypass (Images)
  if (url.hostname === 'image.tmdb.org') {
    return; // Standard fetch, no respondWith needed for bypass
  }

  // 3. THE PROXY LOGIC (Wrapped safely)
  event.respondWith((async () => {
    try {
      // Load config safely
      await scramjet.loadConfig();

      if (scramjet.route(event)) {
        return scramjet.fetch(event);
      }

      return fetch(event.request);
    } catch (err) {
      console.error('[Scramjet SW] Config error (DB corrupt?), passing through:', err);
      // Fallback to network if proxy fails (prevents white screen)
      return fetch(event.request);
    }
  })());
});
