import type { CompanyDTO } from "@/types/company";

export function formatCompanyMessage(company: CompanyDTO): string {
  const lines = [
    `🚨 ${company.name}`,
    company.address,
    company.phone ? `Phone: ${company.phone}` : null,
    company.notes ? `Notes: ${company.notes}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export async function fetchImageAsFile(imageUrl: string, filename: string): Promise<File> {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

export function canShareFiles(files: File[]): boolean {
  return typeof navigator !== "undefined" && "canShare" in navigator && navigator.canShare?.({ files });
}