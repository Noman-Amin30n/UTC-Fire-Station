import { z } from "zod";

export const companyFormSchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(200),
  address: z.string().trim().min(1, "Address is required").max(500),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").max(200).optional().or(z.literal("")),
  contactPerson: z.string().trim().max(200).optional().or(z.literal("")),
  companyCode: z.string().trim().max(50).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;