const VERSION = "2026.05.26-offline.3";
const CACHE_NAME = `neuro-exam-${VERSION}`;
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app-data.js",
  "./app-events.js",
  "./app-state.js",
  "./app-render.js",
  "./app-summary.js",
  "./manifest.webmanifest",
  "./icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS.map((asset) => new Request(asset, { cache: "reload" })));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => notifyClients({ type: "OFFLINE_READY", version: VERSION }))
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request, "./index.html"));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "GET_OFFLINE_STATUS") {
    event.source?.postMessage({ type: "OFFLINE_READY", version: VERSION });
  }
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    refreshCache(request);
    return cached;
  }
  return fetchAndCache(request);
}

async function networkFirst(request, fallbackUrl) {
  try {
    return await fetchAndCache(request);
  } catch {
    return (await caches.match(request)) || (await caches.match(fallbackUrl));
  }
}

async function fetchAndCache(request) {
  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

function refreshCache(request) {
  fetchAndCache(request).catch(() => {});
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
  for (const client of clients) {
    client.postMessage(message);
  }
}
