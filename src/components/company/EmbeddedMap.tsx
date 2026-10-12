"use client";

import { useState, useEffect } from "react";
import { Loader2, MapPin } from "lucide-react";

interface EmbeddedMapProps {
  /** The Google Maps embed/share URL stored in the database — used to extract
   *  the destination for the directions embed, and as the fallback if
   *  geolocation is unavailable. */
  googleMapsUrl: string;
  /** Plain-text destination address / company name used to build the
   *  directions embed URL when geolocation succeeds. */
  destination?: string;
  title?: string;
}

/**
 * Builds a `maps.google.com` embed URL that shows turn-by-turn directions
 * from `origin` (lat,lng string or address) to `destination`.
 *
 * This endpoint does NOT require an API key and works reliably in iframes.
 */
function buildDirectionsEmbedUrl(origin: string, destination: string): string {
  const params = new URLSearchParams({
    saddr: origin,
    daddr: destination,
    output: "embed",
  });
  return `https://maps.google.com/maps?${params.toString()}`;
}

type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "granted"; lat: number; lng: number }
  | { status: "denied" };

export function EmbeddedMap({
  googleMapsUrl,
  destination,
  title = "Google Maps",
}: EmbeddedMapProps) {
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });

  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeo({ status: "denied" });
      return;
    }

    setGeo({ status: "loading" });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          status: "granted",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setGeo({ status: "denied" });
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  // Determine the iframe src to render
  const iframeSrc = (() => {
    if (geo.status === "granted" && destination) {
      return buildDirectionsEmbedUrl(
        `${geo.lat},${geo.lng}`,
        destination,
      );
    }
    // Fallback: show the stored static map URL
    return googleMapsUrl;
  })();

  return (
    <div className="relative overflow-hidden rounded-lg border border-border shadow-inner bg-muted aspect-video w-full">
      {/* Loading overlay while waiting for geolocation */}
      {geo.status === "loading" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-muted/90 backdrop-blur-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Fetching your location…</span>
        </div>
      )}

      {/* Soft notice when location was denied — map still shows, just no directions */}
      {geo.status === "denied" && destination && (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center gap-1.5 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
          <MapPin className="h-3 w-3 shrink-0" />
          Enable location for turn-by-turn directions
        </div>
      )}

      {(geo.status === "granted" || geo.status === "denied" || geo.status === "idle") && (
        <iframe
          src={iframeSrc}
          title={title}
          width="100%"
          height="100%"
          style={{ border: 0, position: "absolute", inset: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
    </div>
  );
}
