"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold">Admin action failed</h1>
      <p className="text-muted-foreground">
        Nothing was lost, but the last operation didn&apos;t complete. Try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}