const CACHE_NAME = "edutoks-shell-v4";
const SHELL = [
  "/",
  "/manifest.webmanifest",
  "/icons/edutoks-logo.svg",
  "/icons/digital-hands-foundation.svg"
];
const STATIC_ASSET = /\.(?:js|mjs|css|svg|png|jpe?g|webp|ico|woff2?)$/i;

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL))
      .catch(error => console.warn("EduToks shell cache incomplete:", error))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith("edutoks-shell-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache authentication, database, edge-function or user-specific API responses.
  if (/^\/(?:rest|auth|functions|storage|realtime)(?:\/|$)/.test(url.pathname)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("/", copy));
        }
        return response;
      }).catch(() => caches.match("/"))
    );
    return;
  }

  // Cache only same-origin static application assets. Refresh them in the background
  // so an installed PWA can reopen offline after its first successful online visit.
  if (STATIC_ASSET.test(url.pathname) || url.pathname === "/manifest.webmanifest") {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(request);
        const network = fetch(request).then(response => {
          if (response.ok && response.type === "basic") {
            cache.put(request, response.clone());
          }
          return response;
        });
        return cached || network;
      })
    );
  }
});

self.addEventListener("push", event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "EduToks", body: event.data?.text() || "You have a new notification." };
  }

  const title = data.title || "EduToks";
  const options = {
    body: data.body || "",
    icon: "/icons/edutoks-logo.svg",
    badge: "/icons/edutoks-logo.svg",
    data: { url: data.url || "/" },
    tag: data.tag || "edutoks-notification"
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
