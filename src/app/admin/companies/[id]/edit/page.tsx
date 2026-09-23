import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCompanyById } from "@/lib/companies";
import { updateCompany } from "@/actions/company-actions";
import { CompanyForm } from "@/components/company/CompanyForm";

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const company = await getCompanyById(id);
  if (!company) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Edit {company.name}</h1>
      <CompanyForm
        action={updateCompany.bind(null, id)}
        submitLabel="Save changes"
        existingImageUrl={company.imageUrl}
        defaultValues={{
          name: company.name,
          address: company.address,
          phone: company.phone ?? "",
          email: company.email ?? "",
          contactPerson: company.contactPerson ?? "",
          companyCode: company.companyCode ?? "",
          notes: company.notes ?? "",
          googleMapsUrl: company.googleMapsUrl ?? "",
        }}
      />
    </div>
  );
}