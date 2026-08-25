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
        checkValidServiceWorker(
          swUrl,
          config
        );
      } else {
        registerValidSW(
          swUrl,
          config
        );
      }
    });
  }
}

function registerValidSW(
  swUrl,
  config
) {
  navigator.serviceWorker
    .register(swUrl, {
      updateViaCache: "none",
    })
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker =
          registration.installing;

        if (!installingWorker) {
          return;
        }

        installingWorker.onstatechange =
          () => {
            if (
              installingWorker.state ===
              "installed"
            ) {
              if (
                navigator.serviceWorker
                  .controller
              ) {
                console.log(
                  "A new version of Yonkopa is available."
                );

                if (config?.onUpdate) {
                  config.onUpdate(
                    registration
                  );
                }
              } else {
                console.log(
                  "Yonkopa is ready to work offline."
                );

                if (config?.onSuccess) {
                  config.onSuccess(
                    registration
                  );
                }
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

function checkValidServiceWorker(
  swUrl,
  config
) {
  fetch(swUrl, {
    headers: {
      "Service-Worker": "script",
    },
    cache: "no-store",
  })
    .then((response) => {
      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        response.status === 404 ||
        (contentType &&
          !contentType.includes(
            "javascript"
          ))
      ) {
        navigator.serviceWorker.ready
          .then((registration) => {
            registration.unregister();
          })
          .then(() => {
            window.location.reload();
          });

        return;
      }

      registerValidSW(
        swUrl,
        config
      );
    })
    .catch(() => {
      console.log(
        "No internet connection. Using cached Yonkopa files."
      );
    });
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(
          "Service worker unregister failed:",
          error
        );
      });
  }
}