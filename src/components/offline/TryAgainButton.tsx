"use client";

import { RefreshCw } from "lucide-react";

export function TryAgainButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 cursor-pointer"
    >
      <RefreshCw className="h-4 w-4" />
      Try Again
    </button>
  );
}
