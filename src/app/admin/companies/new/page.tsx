import { requireAdmin } from "@/lib/auth";
import { createCompany } from "@/actions/company-actions";
import { CompanyForm } from "@/components/company/CompanyForm";

export default async function NewCompanyPage() {
  await requireAdmin();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Add company</h1>
      <CompanyForm action={createCompany} submitLabel="Create company" />
    </div>
  );
}