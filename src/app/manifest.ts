import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UTC Emergency Dispatch",
    short_name: "UTC Dispatch",
    description: "Emergency lookup and dispatch system for UTC Fire Station personnel, providing rapid access to registered companies, emergency contacts, zones, addresses, and structural information within the KEPZ zone.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}