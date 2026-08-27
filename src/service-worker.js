/* eslint-disable no-restricted-globals */

import { clientsClaim } from "workbox-core";
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
} from "workbox-precaching";

clientsClaim();

self.skipWaiting();

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});