"use client";

import { useOffline } from "@/components/offline/OfflineProvider";
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function formatSyncTime(isoString: string | null | undefined): string {
  if (!isoString) return "Never";
  try {
    return new Intl.DateTimeFormat("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(isoString));
  } catch {
    return "Unknown";
  }
}

export function SyncStatusBar() {
  const { connection, sync, triggerSync } = useOffline();

  const isOffline = connection === "offline";
  const isSyncing = sync.state === "syncing";
  const hasError = sync.state === "error";

  const lastSyncedAt =
    sync.state === "success"
      ? sync.lastSyncedAt
      : sync.state === "error"
      ? sync.lastSyncedAt
      : null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 select-none",
        isOffline
          ? "bg-amber-50 border border-amber-200 text-amber-800"
          : hasError
          ? "bg-red-50 border border-red-200 text-red-800"
          : isSyncing
          ? "bg-blue-50 border border-blue-200 text-blue-800"
          : "bg-emerald-50 border border-emerald-200 text-emerald-800"
      )}
    >
      {/* Status icon */}
      {isOffline ? (
        <WifiOff className="h-3.5 w-3.5 shrink-0" />
      ) : isSyncing ? (
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
      ) : hasError ? (
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <Wifi className="h-3.5 w-3.5 shrink-0" />
      )}

      {/* Status text */}
      <span className="hidden sm:inline">
        {isOffline ? (
          <>Offline — using local data</>
        ) : isSyncing ? (
          <>Syncing…</>
        ) : hasError ? (
          <>Sync failed — {lastSyncedAt ? `last synced ${formatSyncTime(lastSyncedAt)}` : "using local data"}</>
        ) : (
          <>
            {sync.state === "success" ? (
              <>
                <CheckCircle className="inline h-3 w-3 mr-0.5" />
                Synced {formatSyncTime(lastSyncedAt)}
              </>
            ) : (
              <>Online</>
            )}
          </>
        )}
      </span>

      {/* Mobile-only abbreviated status */}
      <span className="sm:hidden">
        {isOffline ? "Offline" : isSyncing ? "Syncing…" : hasError ? "Sync failed" : "Online"}
      </span>

      {/* Sync Now button — only when not currently syncing and not offline (can still try when error) */}
      {!isSyncing && (
        <button
          onClick={() => void triggerSync()}
          disabled={isSyncing}
          title={isOffline ? "Cannot sync while offline" : "Sync now"}
          aria-label="Sync data now"
          className={cn(
            "ml-1 flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors",
            isOffline
              ? "opacity-40 cursor-not-allowed"
              : "cursor-pointer hover:bg-black/10 active:bg-black/20"
          )}
        >
          <RefreshCw className="h-2.5 w-2.5" />
          <span className="hidden sm:inline">Sync</span>
        </button>
      )}
    </div>
  );
}
