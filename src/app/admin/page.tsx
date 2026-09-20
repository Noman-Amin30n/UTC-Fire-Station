import { requireAdmin } from "@/lib/auth";
import { getAllCompanies } from "@/lib/companies";
import { ShieldAlert, LayoutDashboard, Building2, Plus, Users, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CompanyAdminTable } from "@/components/company/CompanyAdminTable";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const companies = await getAllCompanies();

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground shadow-sm border border-border/50">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {session.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="gap-2 shadow-sm">
            <Link href="/admin/companies/new">
              <Plus className="h-4 w-4" />
              New Company
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/admin/companies" className="group flex flex-col items-start justify-between rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:ring-1 hover:ring-primary/20">
          <div className="flex items-center gap-4 w-full">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Companies</p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">{companies.length}</h2>
            </div>
          </div>
        </Link>
        <div className="flex flex-col items-start justify-between rounded-xl border border-border/50 bg-card p-6 shadow-sm opacity-70">
          <div className="flex items-center gap-4 w-full">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">1</h2>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start justify-between rounded-xl border border-border/50 bg-card p-6 shadow-sm opacity-70">
          <div className="flex items-center gap-4 w-full">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">System Status</p>
              <h2 className="text-xl font-bold tracking-tight text-emerald-500 mt-1">Operational</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            Company Management
          </h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/companies">Manage Directory</Link>
          </Button>
        </div>
        <div className="rounded-xl border border-border/50 bg-card shadow-sm p-4 sm:p-6 overflow-hidden">
          <CompanyAdminTable companies={companies} />
        </div>
      </div>
    </div>
  );
}