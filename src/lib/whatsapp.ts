import type { CompanyDTO } from "@/types/company";

export function formatCompanyMessage(company: CompanyDTO, origin?: string): string {
  // Use company ID so the URL stays short and WhatsApp can parse it as a clickable link.
  // The map page fetches the embed URL server-side using this ID.
  const mapLink =
    company._id && company.googleMapsUrl && origin
      ? `${origin}/map?id=${company._id}`
      : company.googleMapsUrl;

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