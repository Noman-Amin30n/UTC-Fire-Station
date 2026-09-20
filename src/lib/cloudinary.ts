import { v2 as cloudinary } from "cloudinary";
import { env } from "@/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const UPLOAD_FOLDER = "utc-fire-companies";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type UploadedImage = { url: string; publicId: string };

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "Image must be JPEG, PNG, or WebP";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be under 5MB";
  }
  return null;
}

export async function uploadCompanyImage(file: File): Promise<UploadedImage> {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: UPLOAD_FOLDER, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    uploadStream.end(buffer);
  });
}

export async function deleteCompanyImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

export async function replaceCompanyImage(
  file: File,
  oldPublicId?: string,
): Promise<UploadedImage> {
  const uploaded = await uploadCompanyImage(file);

  if (oldPublicId) {
    await deleteCompanyImage(oldPublicId).catch(() => {
      console.error(`Failed to delete old Cloudinary asset: ${oldPublicId}`);
    });
  }

  return uploaded;
}