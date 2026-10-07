import type { CompanyDTO } from "@/types/company";

/**
 * Builds a Google Maps Directions URL that routes from the user's current
 * location (no explicit origin → Google Maps uses device GPS) to the
 * company via the best driving route.
 *
 * Falls back to a plain search URL if no address is available.
 */
export function buildDirectionsUrl(company: CompanyDTO): string {
  // Prefer using name + address as the destination so Google can pin it
  // precisely on the map. Omitting `origin` makes Google Maps prompt the
  // user's device for its current location automatically.
  const destination = [company.name, company.address].filter(Boolean).join(", ");

  const params = new URLSearchParams({
    api: "1",
    destination,
    travelmode: "driving",
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function formatCompanyMessage(company: CompanyDTO): string {
  // Build a turn-by-turn directions link so the recipient can navigate
  // straight to the company from their current location.
  const directionsLink = company.address || company.googleMapsUrl
    ? buildDirectionsUrl(company)
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