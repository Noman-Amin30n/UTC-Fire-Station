import { logoutAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1 w-full bg-muted/10">
      <header className="sticky top-16 z-40 flex items-center justify-between border-b border-border/40 bg-card/80 px-4 sm:px-8 py-3 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold tracking-wide text-foreground uppercase">Admin Console</span>
        </div>
        <form action={logoutAction}>
          <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground hover:text-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </form>
      </header>
      <div className="flex-1 p-4 sm:p-8 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          {children}
        </div>
      </div>
    </div>
  );
}