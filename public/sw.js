importScripts("/scramjet/scramjet.all.js");

const { ScramjetServiceWorker } = $scramjetLoadWorker();
const scramjet = new ScramjetServiceWorker();

self.addEventListener("fetch", (event) => {
  event.respondWith((async () => {
    await scramjet.loadConfig();

    // Scramjet handles ONLY its traffic
    if (scramjet.route(event)) {
      return scramjet.fetch(event);
    }

    // Everything else goes direct
    return fetch(event.request);
  })());
});
