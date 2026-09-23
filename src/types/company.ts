export type CompanyDTO = {
  _id: string;
  name: string;
  searchName: string;
  address: string;
  imageUrl: string;
  imagePublicId: string;
  googleMapsUrl?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  companyCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export function toCompanyDTO(doc: Record<string, unknown>): CompanyDTO {
  return {
    _id: String(doc._id),
    name: doc.name as string,
    searchName: doc.searchName as string,
    address: doc.address as string,
    imageUrl: doc.imageUrl as string,
    imagePublicId: doc.imagePublicId as string,
    googleMapsUrl: doc.googleMapsUrl as string | undefined,
    phone: doc.phone as string | undefined,
    email: doc.email as string | undefined,
    contactPerson: doc.contactPerson as string | undefined,
    companyCode: doc.companyCode as string | undefined,
    notes: doc.notes as string | undefined,
    createdAt: new Date(doc.createdAt as string).toISOString(),
    updatedAt: new Date(doc.updatedAt as string).toISOString(),
  };
}