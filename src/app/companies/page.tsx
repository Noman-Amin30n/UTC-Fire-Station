import { getAllCompanies } from "@/lib/companies";
import { CompanyAccordionList } from "@/components/company/CompanyAccordionList";
import { Building2 } from "lucide-react";

export default async function CompaniesPage() {
  const companies = await getAllCompanies();

  return (
    <main className="flex flex-col items-center flex-1 w-full pb-16">
      <div className="w-full border-b border-border/40 bg-muted/30 pt-12 pb-16 mb-8">
        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Registered Companies
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl text-balance">
            Browse the complete directory of {companies.length} companies currently registered in the KEPZ emergency dispatch database.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 w-full">
        <CompanyAccordionList companies={companies} />
      </div>
    </main>
  );
}