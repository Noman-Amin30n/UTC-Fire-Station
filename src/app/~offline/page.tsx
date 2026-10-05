import { Flame, WifiOff, Building2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { TryAgainButton } from "@/components/offline/TryAgainButton";

export const metadata: Metadata = {
  title: "Offline — UTC Emergency Dispatch",
  description: "The application is currently offline. Locally stored data is still available.",
  robots: { index: false, follow: false },
};

/**
 * Offline fallback page — served by the Service Worker when the device
 * is offline and the requested page is not in the SW cache.
 *
 * This page is static (no server data), intentionally.
 * The client-side OfflineProvider will display the last sync time.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 text-center bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-md w-full space-y-8">
        {/* UTC Branding */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-sm">
            <Flame className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-amber-600">
            <WifiOff className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Device Offline</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            UTC Emergency Dispatch
          </h1>

          <p className="text-muted-foreground text-balance">
            Your device is not connected to the internet. The application is operating using
            locally stored data from your last synchronization.
          </p>
        </div>

        {/* Status card */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-left space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Local Data Available</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Company records, emergency contacts, and addresses from your last sync are available offline.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <TryAgainButton />

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted"
          >
            <Flame className="h-4 w-4 text-primary" />
            Go to Emergency Lookup
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          UTC Fire Station · Emergency Dispatch System · Internal Use Only
        </p>
      </div>
    </main>
  );
}
