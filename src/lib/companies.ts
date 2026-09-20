import { connectDB } from "@/lib/db";
import { Company } from "@/models/Company";
import { toCompanyDTO, type CompanyDTO } from "@/types/company";

export async function getAllCompanies(): Promise<CompanyDTO[]> {
  await connectDB();
  const docs = await Company.find().sort({ name: 1 }).lean();
  return docs.map((doc) => toCompanyDTO(doc as Record<string, unknown>));
}

export async function getCompanyById(id: string): Promise<CompanyDTO | null> {
  await connectDB();
  const doc = await Company.findById(id).lean();
  return doc ? toCompanyDTO(doc as Record<string, unknown>) : null;
}

export async function getCompanyCount(): Promise<number> {
  await connectDB();
  return Company.countDocuments();
}