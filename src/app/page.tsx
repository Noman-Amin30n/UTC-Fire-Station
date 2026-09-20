import { getCompanyCount } from "@/lib/companies";
import { CompanySearchInput } from "@/components/company/CompanySearchInput";
import { ShieldAlert, Flame } from "lucide-react";

export default async function Home() {
  const totalCompanies = await getCompanyCount();

  return (
    <main className="flex flex-col items-center flex-1 w-full">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden border-b border-border/40 bg-gradient-to-b from-background to-background/50 pt-24 pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="container relative mx-auto flex flex-col items-center justify-center px-4 sm:px-6">
          <div className="mb-6 flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
            <Flame className="h-4 w-4" />
            <span>EMERGENCY DISPATCH SYSTEM</span>
          </div>
          <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl max-w-3xl text-foreground">
            UTC Fire Station <br className="hidden sm:block" /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-destructive">Emergency Lookup</span>
          </h1>
          <p className="mt-6 text-center text-lg text-muted-foreground max-w-2xl text-balance">
            Instantly locate registered companies, emergency contacts, and structural details for rapid response within the KEPZ zone.
          </p>
          
          <div className="mt-12 w-full max-w-3xl">
            <CompanySearchInput totalCompanies={totalCompanies} />
          </div>
        </div>
      </section>

      {/* Decorative / Info Footer-like section for home */}
      <section className="container mx-auto px-4 py-16 flex flex-col items-center text-center opacity-60">
        <ShieldAlert className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Internal Use Only</p>
        <p className="mt-2 text-xs text-muted-foreground max-w-md">
          This system is restricted to authorized UTC Fire Station personnel. Ensure all lookups comply with operational security protocols.
        </p>
      </section>
    </main>
  );
}