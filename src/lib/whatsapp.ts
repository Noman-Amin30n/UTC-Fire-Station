import type { CompanyDTO } from "@/types/company";

/**
 * Converts a Google Maps embed URL (…/maps/embed?pb=…) to a regular
 * shareable Google Maps URL (…/maps?pb=…) that opens directly in Google Maps.
 */
function embedUrlToDirectUrl(embedUrl: string): string {
  try {
    const url = new URL(embedUrl);
    // Remove the "/embed" segment from the pathname if present.
    url.pathname = url.pathname.replace(/\/embed\/?$/, "");
    return url.toString();
  } catch {
    return embedUrl;
  }
}

export function formatCompanyMessage(company: CompanyDTO): string {
  // Convert the embed URL to a direct Google Maps link so recipients are
  // taken straight to Google Maps instead of a local page.
  const mapLink = company.googleMapsUrl
    ? embedUrlToDirectUrl(company.googleMapsUrl)
    : undefined;

  const lines = [
    `🚨 *${company.name}*`,
    company.address,
    company.phone ? `📞 Phone: ${company.phone}` : null,
    company.notes ? `📝 Notes: ${company.notes}` : null,
    mapLink ? `📍 Map:\n${mapLink}` : null,
  ].filter(Boolean);

  return lines.join("\n\n");
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}