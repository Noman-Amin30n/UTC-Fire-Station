import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { normalizeSearchName } from "@/lib/utils";

const companySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200, unique: true },
    searchName: { type: String, required: true, index: true },
    address: { type: String, required: true, trim: true, maxlength: 500 },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    phone: { type: String, trim: true, maxlength: 30 },
    email: { type: String, trim: true, lowercase: true, maxlength: 200 },
    contactPerson: { type: String, trim: true, maxlength: 200 },
    companyCode: { type: String, trim: true, maxlength: 50, sparse: true, unique: true },
    notes: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

companySchema.pre("validate", function () {
  if (this.name) this.searchName = normalizeSearchName(this.name);
});

export type CompanyDocument = InferSchemaType<typeof companySchema>;

export const Company: Model<CompanyDocument> =
  models.Company ?? model<CompanyDocument>("Company", companySchema);