import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold">Not found</h1>
      <p className="text-muted-foreground">
        That page or company record doesn&apos;t exist.
      </p>
      <Button asChild>
        <Link href="/">Back to lookup</Link>
      </Button>
    </main>
  );
}