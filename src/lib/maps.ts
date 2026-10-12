/**
 * Extracts the destination coordinates or query string from a Google Maps URL
 * so we can reuse the exact same destination while swapping in the user's
 * current location as the origin.
 *
 * Handles the three most common URL formats stored by admins:
 *
 * 1. Embed URL  — https://www.google.com/maps/embed?pb=!1m18!...!2d<lng>!3d<lat>!...
 * 2. Place URL  — https://www.google.com/maps/place/NAME/@<lat>,<lng>,<zoom>z/...
 * 3. Search URL — https://www.google.com/maps/search/?api=1&query=<q>
 *                 https://maps.google.com/maps?q=<q>&output=embed
 */

// --- Format 1: Extract from pb= parameter ---
// The pb string looks like:
//   !1m18!1m12!1m3!1d...!2d<lng>!3d<lat>!3m2!...
// The first occurrence of !2d<lng>!3d<lat> is the destination.
function extractCoordsFromPb(pb: string): { lat: number; lng: number } | null {
  const match = pb.match(/!2d(-?\d+\.\d+)!3d(-?\d+\.\d+)/);
  if (match) {
    const lng = parseFloat(match[1]);
    const lat = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return null;
}

// --- Format 2: Extract from /place/NAME/@lat,lng or any /@lat,lng pattern ---
function extractCoordsFromAtNotation(url: string): { lat: number; lng: number } | null {
  const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return null;
}

// --- Format 3: Extract q= or query= param ---
function extractQueryParam(url: string): string | null {
  try {
    const u = new URL(url);
    return u.searchParams.get("q") ?? u.searchParams.get("query") ?? null;
  } catch {
    return null;
  }
}

export type DestinationInfo =
  | { type: "coords"; lat: number; lng: number }
  | { type: "query"; q: string };

/**
 * Parses a stored Google Maps URL and returns the best representation of its
 * destination — either as precise coordinates (preferred) or a text query.
 * Returns null if the destination cannot be determined.
 */
export function extractDestinationFromMapsUrl(url: string): DestinationInfo | null {
  try {
    const u = new URL(url);

    // Format 1: embed?pb= (most common — Google Maps "Embed a map" flow)
    const pb = u.searchParams.get("pb");
    if (pb) {
      const coords = extractCoordsFromPb(pb);
      if (coords) return { type: "coords", ...coords };
    }

    // Format 2: /place/.../@lat,lng or any /@lat,lng in path/query
    const coordsFromAt = extractCoordsFromAtNotation(url);
    if (coordsFromAt) return { type: "coords", ...coordsFromAt };

    // Format 3: q= or query= param
    const q = extractQueryParam(url);
    if (q) return { type: "query", q };

    return null;
  } catch {
    return null;
  }
}

/**
 * Builds an embeddable Google Maps directions iframe URL using
 * `maps.google.com/maps` (no API key required).
 *
 * @param origin - user's current lat/lng
 * @param dest   - destination parsed from the stored URL
 */
export function buildDirectionsEmbedUrl(
  origin: { lat: number; lng: number },
  dest: DestinationInfo,
): string {
  const daddrValue =
    dest.type === "coords" ? `${dest.lat},${dest.lng}` : dest.q;

  const params = new URLSearchParams({
    saddr: `${origin.lat},${origin.lng}`,
    daddr: daddrValue,
    output: "embed",
  });

  return `https://maps.google.com/maps?${params.toString()}`;
}
