import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAllCompanies } from "@/lib/companies";
import { Button } from "@/components/ui/button";
import { CompanyAdminTable } from "@/components/company/CompanyAdminTable";

export default async function AdminCompaniesPage() {
  await requireAdmin();
  const companies = await getAllCompanies();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Companies ({companies.length})</h1>
        <Button asChild>
          <Link href="/admin/companies/new">Add company</Link>
        </Button>
      </div>
      <CompanyAdminTable companies={companies} />
    </div>
  );
}