importScripts('/scram/scramjet.all.js');

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

// Must clear old DB so you don’t hit NotFoundError
self.addEventListener("install", (event) => {
  event.waitUntil(
    indexedDB.deleteDatabase("scramjet")
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  let url;

  try {
    url = new URL(req.url);
  } catch(e) {
    // If URL is truly invalid, fallback
    return;
  }

  // Bypass non-http(s)
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Bypass ads/tracking and other 3rd party hosts you don’t want proxying
  if (
    url.hostname.includes("googlesyndication.com") ||
    url.hostname.includes("doubleclick.net") ||
    url.hostname.includes("googleadservices.com") ||
    url.hostname.includes("adtrafficquality.google")
  ) {
    return;
  }

  // TMDB images, etc: bypass
  if (url.hostname === "image.tmdb.org") {
    event.respondWith(fetch(req));
    return;
  }

  event.respondWith((async () => {
    try {
      await scramjet.loadConfig();

      if (scramjet.route(event)) {
        return scramjet.fetch(event);
      }

      return fetch(req);
    } catch (err) {
      console.error("[Scramjet SW] Fatal error:", err);
      return fetch(req);
    }
  })());
});
