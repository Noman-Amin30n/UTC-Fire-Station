import type { CompanyDTO } from "@/types/company";

export function formatCompanyMessage(company: CompanyDTO): string {
  const lines = [
    `🚨 ${company.name}`,
    company.address,
    company.phone ? `Phone: ${company.phone}` : null,
    company.notes ? `Notes: ${company.notes}` : null,
    company.googleMapsUrl ? `📍 Map: ${company.googleMapsUrl}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}