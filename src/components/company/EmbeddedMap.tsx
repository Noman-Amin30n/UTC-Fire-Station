"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, MapPin } from "lucide-react";
import {
  extractCoordinates,
  extractDestinationFromMapsUrl,
  cleanMapUrl,
  buildDirectionsEmbedUrl,
} from "@/lib/maps";

interface EmbeddedMapProps {
  /** The Google Maps embed/share URL stored in the database. Used both as a
   *  fallback iframe src and as the source from which we extract the precise
   *  destination coordinates for the directions embed. */
  googleMapsUrl: string;
  companyName?: string;
  address?: string;
  title?: string;
}

type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "granted"; lat: number; lng: number }
  | { status: "denied" };

export function EmbeddedMap({
  googleMapsUrl,
  companyName,
  address,
  title = "Google Maps",
}: EmbeddedMapProps) {
  const [geo, setGeo] = useState<GeoState>({ status: "idle" });

  const cleanedUrl = useMemo(() => cleanMapUrl(googleMapsUrl), [googleMapsUrl]);

  // Priority 1: Exact longitude and latitude coordinates from stored URL or address
  const destCoords = useMemo(
    () => extractCoordinates(googleMapsUrl) || extractCoordinates(address),
    [googleMapsUrl, address],
  );

  // Priority 2: Fallback destination (parsed query or company name + address)
  const fallbackDestination = useMemo(() => {
    if (destCoords) return null;
    const fromUrl = extractDestinationFromMapsUrl(googleMapsUrl);
    if (fromUrl) return fromUrl;
    const nameAndAddr = [companyName, address].filter(Boolean).join(", ");
    return nameAndAddr ? { type: "query" as const, q: nameAndAddr } : null;
  }, [destCoords, googleMapsUrl, companyName, address]);

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
        // Permission denied or unavailable — fall back to the stored URL.
        setGeo({ status: "denied" });
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  // Determine which iframe src to render:
  // • If user GPS is granted and we have exact coordinates:
  //   build directions embed: starting point = user GPS, destination = exact coordinates.
  // • If user GPS is granted and we only have fallback name/address:
  //   build directions embed with fallback.
  // • Otherwise: show the stored clean map URL unchanged.
  const iframeSrc = useMemo(() => {
    if (geo.status === "granted") {
      const origin = { lat: geo.lat, lng: geo.lng };
      if (destCoords) {
        return buildDirectionsEmbedUrl(origin, destCoords);
      }
      if (fallbackDestination) {
        return buildDirectionsEmbedUrl(origin, fallbackDestination);
      }
    }
    return cleanedUrl;
  }, [geo, destCoords, fallbackDestination, cleanedUrl]);

  const showMap = geo.status !== "loading";
  const hasDestination = Boolean(destCoords || fallbackDestination);

  return (
    <div className="relative overflow-hidden rounded-lg border border-border shadow-inner bg-muted aspect-video w-full">
      {/* Loading overlay while waiting for geolocation permission */}
      {geo.status === "loading" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-muted/90 backdrop-blur-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Fetching your location…</span>
        </div>
      )}

      {/* Hint banner when location was denied but map still shows */}
      {geo.status === "denied" && hasDestination && (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center gap-1.5 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
          <MapPin className="h-3 w-3 shrink-0" />
          Enable location for turn-by-turn directions from your position
        </div>
      )}

      {showMap && (
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

