/* eslint-disable no-restricted-globals */

const CACHE_NAME = "yonkopa-pwa-v2";
const OFFLINE_URL = "/index.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/manifest.json",
      ]);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName !== CACHE_NAME
          )
          .map((cacheName) =>
            caches.delete(cacheName)
          )
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            if (
              !response ||
              response.status !== 200 ||
              response.type === "opaque"
            ) {
              return response;
            }

            const responseClone =
              response.clone();

            caches
              .open(CACHE_NAME)
              .then((cache) => {
                cache.put(
                  event.request,
                  responseClone
                );
              });

            return response;
          })
          .catch(() => {
            if (
              event.request.mode ===
              "navigate"
            ) {
              return caches.match(
                OFFLINE_URL
              );
            }

            return new Response(
              "Offline",
              {
                status: 503,
                headers: {
                  "Content-Type":
                    "text/plain",
                },
              }
            );
          });
      })
  );
});