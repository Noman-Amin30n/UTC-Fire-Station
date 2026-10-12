import type { CompanyDTO } from "@/types/company";

export interface UserCoords {
  lat: number;
  lng: number;
}

/**
 * Builds a Google Maps Directions URL that routes to the company.
 *
 * When `userCoords` are provided (fetched via the Geolocation API), they are
 * used as the precise `origin` so the link opens turn-by-turn directions from
 * the user's exact GPS position.
 *
 * Without coords the `origin` param is omitted, which causes Google Maps to
 * prompt the recipient's device for its current location automatically.
 */
export function buildDirectionsUrl(company: CompanyDTO, userCoords?: UserCoords): string {
  const destination = [company.name, company.address].filter(Boolean).join(", ");

  const params = new URLSearchParams({
    api: "1",
    destination,
    travelmode: "driving",
  });

  if (userCoords) {
    params.set("origin", `${userCoords.lat},${userCoords.lng}`);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function formatCompanyMessage(company: CompanyDTO, userCoords?: UserCoords): string {
  // Build a turn-by-turn directions link. If we have the user's live GPS
  // coordinates, bake them into the link as the origin so the recipient
  // gets directions from the dispatcher's actual location.
  const directionsLink = company.address || company.googleMapsUrl
    ? buildDirectionsUrl(company, userCoords)
    : undefined;

  const lines = [
    `🚨 *${company.name}*`,
    company.address,
    company.phone ? `📞 Phone: ${company.phone}` : null,
    company.notes ? `📝 Notes: ${company.notes}` : null,
    directionsLink ? `📍 Directions:\n${directionsLink}` : null,
  ].filter(Boolean);

  return lines.join("\n\n");
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}