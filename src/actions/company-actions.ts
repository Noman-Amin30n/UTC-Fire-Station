"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Company } from "@/models/Company";
import { requireAdmin } from "@/lib/auth";
import { companyFormSchema } from "@/schemas/company.schema";
import {
  uploadCompanyImage,
  replaceCompanyImage,
  deleteCompanyImage,
  validateImageFile,
} from "@/lib/cloudinary";

export type CompanyActionState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function parseCompanyFormData(formData: FormData) {
  return companyFormSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    contactPerson: formData.get("contactPerson"),
    companyCode: formData.get("companyCode"),
    notes: formData.get("notes"),
  });
}

function toOptional(value: string | undefined): string | undefined {
  return value && value.length > 0 ? value : undefined;
}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: number }).code === 11000;
}

function revalidateCompanyPages() {
  revalidatePath("/admin/companies");
  revalidatePath("/companies");
  revalidatePath("/");
}

export async function createCompany(
  _prevState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  await requireAdmin();

  const parsed = parseCompanyFormData(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const imageFile = formData.get("image");
  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return { error: "A map image is required" };
  }
  const imageError = validateImageFile(imageFile);
  if (imageError) return { error: imageError };

  await connectDB();
  const { url, publicId } = await uploadCompanyImage(imageFile);

  try {
    await Company.create({
      name: parsed.data.name,
      address: parsed.data.address,
      imageUrl: url,
      imagePublicId: publicId,
      phone: toOptional(parsed.data.phone),
      email: toOptional(parsed.data.email),
      contactPerson: toOptional(parsed.data.contactPerson),
      companyCode: toOptional(parsed.data.companyCode),
      notes: toOptional(parsed.data.notes),
    });
  } catch (err) {
    await deleteCompanyImage(publicId).catch(() => {});
    if (isDuplicateKeyError(err)) {
      return { error: "A company with this name or code already exists" };
    }
    throw err;
  }

  revalidateCompanyPages();
  redirect("/admin/companies");
}

export async function updateCompany(
  id: string,
  _prevState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  await requireAdmin();

  const parsed = parseCompanyFormData(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await connectDB();
  const existing = await Company.findById(id);
  if (!existing) return { error: "Company not found" };

  const imageFile = formData.get("image");
  let imageUpdate: { imageUrl: string; imagePublicId: string } | null = null;

  if (imageFile instanceof File && imageFile.size > 0) {
    const imageError = validateImageFile(imageFile);
    if (imageError) return { error: imageError };
    const { url, publicId } = await replaceCompanyImage(imageFile, existing.imagePublicId);
    imageUpdate = { imageUrl: url, imagePublicId: publicId };
  }

  existing.set({
    name: parsed.data.name,
    address: parsed.data.address,
    phone: toOptional(parsed.data.phone),
    email: toOptional(parsed.data.email),
    contactPerson: toOptional(parsed.data.contactPerson),
    companyCode: toOptional(parsed.data.companyCode),
    notes: toOptional(parsed.data.notes),
    ...(imageUpdate ?? {}),
  });

  try {
    await existing.save();
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return { error: "A company with this name or code already exists" };
    }
    throw err;
  }

  revalidateCompanyPages();
  redirect("/admin/companies");
}

export async function deleteCompany(id: string, _formData: FormData): Promise<void> {
  await requireAdmin();
  await connectDB();

  const existing = await Company.findById(id);
  if (!existing) return;

  await deleteCompanyImage(existing.imagePublicId).catch(() => {
    console.error(`Failed to delete Cloudinary asset for company ${id}`);
  });
  await existing.deleteOne();

  revalidateCompanyPages();
}