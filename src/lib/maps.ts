/**
 * Maps utility for extracting exact latitude/longitude coordinates from
 * various Google Maps URL formats (embed, place, search, DMS, dropped pins)
 * and building navigation/embed directions with the user's location as starting point.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export type DestinationInfo =
  | { type: "coords"; lat: number; lng: number }
  | { type: "query"; q: string };

/**
 * Strips iframe markup if pasted by user, returning the raw map URL.
 */
export function cleanMapUrl(input?: string): string {
  if (!input || typeof input !== "string") return "";
  const str = input.trim();
  const iframeMatch = str.match(/src=["']([^"']+)["']/i);
  return iframeMatch ? iframeMatch[1] : str;
}

/**
 * Parses Degrees-Minutes-Seconds (DMS) string into decimal coordinates.
 * Example: 24°51'18.0"N 67°12'18.0"E -> { lat: 24.855, lng: 67.205 }
 */
export function parseDms(dmsStr: string): LatLng | null {
  const dms = dmsStr.match(
    /(\d+)°\s*(\d+)'\s*([\d.]+)"\s*([NS])\s+(\d+)°\s*(\d+)'\s*([\d.]+)"\s*([EW])/i,
  );
  if (dms) {
    let lat = Number(dms[1]) + Number(dms[2]) / 60 + Number(dms[3]) / 3600;
    if (dms[4].toUpperCase() === "S") lat = -lat;
    let lng = Number(dms[5]) + Number(dms[6]) / 60 + Number(dms[7]) / 3600;
    if (dms[8].toUpperCase() === "W") lng = -lng;
    return {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
    };
  }
  return null;
}

/**
 * Validates whether latitude and longitude are within standard geographical bounds.
 */
function isValidLatLng(lat: number, lng: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Extracts exact latitude and longitude from any Google Maps URL or string.
 *
 * Handles:
 * 1. Embed URLs (`pb=`):
 *    - Marker pin coordinates: `!3d<lat>!4d<lng>`
 *    - Base64 DMS label: `!2z<base64>` (e.g. 24°51'18.0"N 67°12'18.0"E)
 *    - Viewport center: `!2d<lng>!3d<lat>`
 * 2. Place and search URLs:
 *    - `@<lat>,<lng>`
 *    - `/place/<lat>,<lng>` or `/dir/<lat>,<lng>`
 *    - Query params: `q=`, `query=`, `destination=`, `daddr=`, `ll=`, `loc:`
 * 3. Text containing DMS coordinates or decimal coordinate pairs.
 */
export function extractCoordinates(input?: string): LatLng | null {
  if (!input || typeof input !== "string") return null;

  const target = cleanMapUrl(input);

  // Decode URL if encoded
  let decoded = target;
  try {
    decoded = decodeURIComponent(target);
  } catch {
    // Keep decoded as target if decoding fails
  }

  // 1. Check for pb= parameter inside embed URLs
  const pbMatch = decoded.match(/pb=([^&]+)/);
  if (pbMatch) {
    const pb = pbMatch[1];

    // Priority 1: In directions embed URLs (!4m...), extract the destination waypoint.
    // The destination waypoint starts with !2s<name> and contains !1d<lat>!2d<lng> or is the last waypoint in the route.
    if (pb.includes("!4m")) {
      // 1a. Destination block with place label: !2s<name>...!1d<lat>!2d<lng>
      const destBlockMatch = decoded.match(
        /!2s([^!]+)(?:![^!]+)*?!1d(-?\d+(?:\.\d+)?)[^!]*!2d(-?\d+(?:\.\d+)?)/,
      );
      if (destBlockMatch) {
        const lat = parseFloat(destBlockMatch[2]);
        const lng = parseFloat(destBlockMatch[3]);
        if (isValidLatLng(lat, lng)) return { lat, lng };
      }

      // 1b. Fallback in directions: take the LAST waypoint in !4m route
      const wpRegex = /!1d(-?\d+(?:\.\d+)?)[^!]*!2d(-?\d+(?:\.\d+)?)/g;
      let m: RegExpExecArray | null;
      let lastWp: LatLng | null = null;
      while ((m = wpRegex.exec(pb)) !== null) {
        const lat = parseFloat(m[1]);
        const lng = parseFloat(m[2]);
        if (isValidLatLng(lat, lng)) {
          lastWp = { lat, lng };
        }
      }
      if (lastWp) return lastWp;
    }

    // Priority 2: Marker pin: !3d<lat>!4d<lng>
    const markerMatch = pb.match(
      /!3d(-?\d+(?:\.\d+)?)(?:![^!]+)*!4d(-?\d+(?:\.\d+)?)/,
    );
    if (markerMatch) {
      const lat = parseFloat(markerMatch[1]);
      const lng = parseFloat(markerMatch[2]);
      if (isValidLatLng(lat, lng)) return { lat, lng };
    }

    // Priority 3: Base64 DMS label in !2z (common for dropped pins)
    const b64Match = pb.match(/!2z([A-Za-z0-9+/=]+)/);
    if (b64Match) {
      try {
        let b64Text = "";
        if (typeof window === "undefined") {
          b64Text = Buffer.from(b64Match[1], "base64").toString("utf8");
        } else {
          b64Text = atob(b64Match[1]);
        }
        const coords = parseDms(b64Text);
        if (coords && isValidLatLng(coords.lat, coords.lng)) return coords;
      } catch {
        // Continue to other patterns if base64 decode fails
      }
    }

    // Priority 4: Viewport / map center: !2d<lng>!3d<lat> (ONLY if not a directions embed)
    if (!pb.includes("!4m")) {
      const vpMatch = pb.match(
        /!2d(-?\d+(?:\.\d+)?)(?:![^!]+)*!3d(-?\d+(?:\.\d+)?)/,
      );
      if (vpMatch) {
        const lng = parseFloat(vpMatch[1]);
        const lat = parseFloat(vpMatch[2]);
        if (isValidLatLng(lat, lng)) return { lat, lng };
      }
    }
  }

  // 2. Check for @<lat>,<lng> pattern
  const atMatch = decoded.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 3. Check for DMS directly in string
  const directDms = parseDms(decoded);
  if (directDms && isValidLatLng(directDms.lat, directDms.lng)) {
    return directDms;
  }

  // 4. Check for query parameters or path formats (q, query, destination, daddr, ll, loc:, /place/)
  const paramCoords = decoded.match(
    /(?:[?&](?:q|query|destination|daddr|ll)=|loc:|\/place\/|\/dir\/)(-?\d+\.\d+)(?:,|%2C|\+)(-?\d+\.\d+)/i,
  );
  if (paramCoords) {
    const lat = parseFloat(paramCoords[1]);
    const lng = parseFloat(paramCoords[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  // 5. Check for standalone lat,lng pair anywhere in string
  const standaloneMatch = decoded.match(
    /(-?\d{1,2}\.\d{3,})(?:\s*,\s*|\s+)(-?\d{1,3}\.\d{3,})/,
  );
  if (standaloneMatch) {
    const lat = parseFloat(standaloneMatch[1]);
    const lng = parseFloat(standaloneMatch[2]);
    if (isValidLatLng(lat, lng)) return { lat, lng };
  }

  return null;
}

/**
 * Gets exact destination coordinates for a company.
 * Checks googleMapsUrl first, then falls back to address.
 */
export function getCompanyCoordinates(company: {
  googleMapsUrl?: string;
  address?: string;
}): LatLng | null {
  if (company.googleMapsUrl) {
    const coords = extractCoordinates(company.googleMapsUrl);
    if (coords) return coords;
  }
  if (company.address) {
    const coords = extractCoordinates(company.address);
    if (coords) return coords;
  }
  return null;
}

/**
 * Extracts either exact coordinates or a text query destination from a Google Maps URL.
 */
export function extractDestinationFromMapsUrl(url: string): DestinationInfo | null {
  const coords = extractCoordinates(url);
  if (coords) {
    return { type: "coords", ...coords };
  }

  try {
    const u = new URL(cleanMapUrl(url));
    const q = u.searchParams.get("q") ?? u.searchParams.get("query");
    if (q) return { type: "query", q };
  } catch {
    // Ignore invalid URL
  }

  return null;
}

/**
 * Builds an embeddable Google Maps directions iframe URL using
 * `maps.google.com/maps` with no API key requirement.
 *
 * @param origin - user's current GPS lat/lng
 * @param dest   - exact lat/lng coordinates or text query destination
 */
export function buildDirectionsEmbedUrl(
  origin: LatLng,
  dest: DestinationInfo | LatLng | string,
): string {
  let daddrValue = "";
  if (typeof dest === "string") {
    daddrValue = dest;
  } else if ("type" in dest) {
    daddrValue = dest.type === "coords" ? `${dest.lat},${dest.lng}` : dest.q;
  } else {
    daddrValue = `${dest.lat},${dest.lng}`;
  }

  const params = new URLSearchParams({
    saddr: `${origin.lat},${origin.lng}`,
    daddr: daddrValue,
    output: "embed",
  });

  return `https://maps.google.com/maps?${params.toString()}`;
}

