const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "[::1]"
);

export function register(config) {
  if (
    process.env.NODE_ENV === "production" &&
    "serviceWorker" in navigator
  ) {
    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log("Service worker registered.");

      registration.update();

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;

        if (!installingWorker) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              console.log(
                "New version available. Reloading..."
              );

              config?.updated?.();

              window.location.reload();
            } else {
              console.log(
                "PWA content cached for offline use."
              );

              config?.success?.();
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error(
        "Service worker registration failed:",
        error
      );
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: {
      "Service-Worker": "script",
    },
  })
    .then((response) => {
      const contentType =
        response.headers.get("content-type");

      if (
        response.status === 404 ||
        (contentType &&
          !contentType.includes("javascript"))
      ) {
        navigator.serviceWorker.ready.then(
          (registration) => {
            registration.unregister().then(() => {
              window.location.reload();
            });
          }
        );
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        "No internet connection. Running offline."
      );
    });
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(
      (registration) => {
        registration.unregister();
      }
    );
  }
}