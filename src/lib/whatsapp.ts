import type { CompanyDTO } from "@/types/company";
import { getCompanyCoordinates } from "@/lib/maps";

export interface UserCoords {
  lat: number;
  lng: number;
}

/**
 * Builds a Google Maps Directions URL that routes to the company.
 *
 * Destination:
 * - Uses the exact latitude and longitude points extracted from the company's
 *   stored Google Maps URL (or address) to guarantee 100% precision.
 * - Falls back to company name + address if exact coordinates cannot be extracted.
 *
 * Origin (Starting point):
 * - When `userCoords` are provided (from Geolocation API), they are embedded as
 *   the exact starting GPS point.
 * - Without `userCoords`, the origin param is omitted so Google Maps prompts
 *   the device for its current location automatically.
 */
export function buildDirectionsUrl(company: CompanyDTO, userCoords?: UserCoords): string {
  const coords = getCompanyCoordinates(company);

  const destination = coords
    ? `${coords.lat},${coords.lng}`
    : [company.name, company.address].filter(Boolean).join(", ");

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