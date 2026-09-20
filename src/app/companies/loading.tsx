import { Skeleton } from "@/components/ui/skeleton";

export default function CompaniesLoading() {
  return (
    <main className="flex min-h-svh flex-col items-center gap-8 p-8">
      <Skeleton className="h-9 w-64" />
      <div className="mx-auto w-full max-w-2xl space-y-3">
        <Skeleton className="h-12 w-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </main>
  );
}