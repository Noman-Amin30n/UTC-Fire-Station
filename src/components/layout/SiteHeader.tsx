import Link from "next/link";
import { Flame, ShieldAlert, Building2, User } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Flame className="h-5 w-5" />
            </div>
            <span className="hidden font-bold tracking-tight sm:inline-block">
              UTC Fire Station
            </span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-medium sm:flex">
            <Link
              href="/"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Lookup
            </Link>
            <Link
              href="/companies"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Companies
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/companies"
            className="flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground sm:hidden"
          >
            <Building2 className="h-4 w-4" />
            <span className="sr-only">Companies</span>
          </Link>
          <Link
            href="/admin"
            className="flex h-9 items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80"
          >
            <ShieldAlert className="mr-2 h-4 w-4" />
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
