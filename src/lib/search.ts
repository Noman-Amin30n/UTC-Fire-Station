import Fuse, { IFuseOptions } from "fuse.js";
import type { CompanyDTO } from "@/types/company";

const fuseOptions: IFuseOptions<CompanyDTO> = {
  keys: ["searchName", "name"],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

export function searchCompanies(query: string, companies: CompanyDTO[], limit = 5): CompanyDTO[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const fuse = new Fuse(companies, fuseOptions);
  return fuse.search(trimmed, { limit }).map((result) => result.item);
}