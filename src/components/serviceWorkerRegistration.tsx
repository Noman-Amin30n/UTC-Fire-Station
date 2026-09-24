"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "UTC Dispatch service worker registered:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error(
            "UTC Dispatch service worker registration failed:",
            error
          );
        });
    }
  }, []);

  return null;
}