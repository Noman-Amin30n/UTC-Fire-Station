"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ConnectionStatus, SyncStatus } from "@/types/offline";
import { getSyncMeta, requestPersistentStorage } from "@/lib/offline/database";
import { syncOfflineData, resetSyncCooldown } from "@/lib/offline/sync";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
type OfflineContextValue = {
  connection: ConnectionStatus;
  sync: SyncStatus;
  triggerSync: () => Promise<void>;
};

const OfflineContext = createContext<OfflineContextValue>({
  connection: "unknown",
  sync: { state: "idle" },
  triggerSync: async () => {},
});

export function useOffline() {
  return useContext(OfflineContext);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [connection, setConnection] = useState<ConnectionStatus>("unknown");
  const [sync, setSync] = useState<SyncStatus>({ state: "idle" });
  const syncLockRef = useRef(false);

  // Initialize connection status from navigator.onLine
  useEffect(() => {
    setConnection(navigator.onLine ? "online" : "offline");
  }, []);

  // Load last sync info from IndexedDB on mount
  useEffect(() => {
    getSyncMeta().then((meta) => {
      if (meta?.lastSyncedAt) {
        setSync({ state: "success", lastSyncedAt: meta.lastSyncedAt });
      }
    });
  }, []);

  const performSync = useCallback(async (force = false) => {
    // Prevent concurrent syncs
    if (syncLockRef.current) return;
    syncLockRef.current = true;

    setSync((prev) => {
      const lastSyncedAt =
        prev.state === "success" || prev.state === "error"
          ? (prev as { lastSyncedAt?: string | null }).lastSyncedAt ?? null
          : null;
      return { state: "syncing", lastSyncedAt: lastSyncedAt ?? undefined } as SyncStatus;
    });

    // Small delay to let the UI render the "Syncing..." state
    await new Promise((r) => setTimeout(r, 100));

    try {
      if (force) resetSyncCooldown();
      const result = await syncOfflineData({ force });

      if (result.ok) {
        const lastSyncedAt = new Date().toISOString();
        setSync({ state: "success", lastSyncedAt });
        setConnection("online");
      } else if (result.reason === "offline" && result.message.includes("cooldown")) {
        // Cooldown hit — restore previous state
        const meta = await getSyncMeta();
        if (meta?.lastSyncedAt) {
          setSync({ state: "success", lastSyncedAt: meta.lastSyncedAt });
        } else {
          setSync({ state: "idle" });
        }
      } else if (result.reason === "offline" || result.reason === "timeout") {
        // Network failure — device is offline
        setConnection("offline");
        const meta = await getSyncMeta();
        setSync({
          state: "error",
          errorMessage: result.message,
          lastSyncedAt: meta?.lastSyncedAt ?? null,
        });
      } else {
        // Server/storage/auth error
        const meta = await getSyncMeta();
        setSync({
          state: "error",
          errorMessage: result.message,
          lastSyncedAt: meta?.lastSyncedAt ?? null,
        });
      }
    } catch (err) {
      console.error("Unexpected sync error:", err);
      const meta = await getSyncMeta();
      setSync({
        state: "error",
        errorMessage: "Unexpected error during sync",
        lastSyncedAt: meta?.lastSyncedAt ?? null,
      });
    } finally {
      syncLockRef.current = false;
    }
  }, []);

  const triggerSync = useCallback(async () => {
    await performSync(true);
  }, [performSync]);

  // Listen for online/offline browser events
  useEffect(() => {
    const handleOnline = () => {
      setConnection("online");
      // Attempt sync when connection returns — real sync confirms connectivity
      void performSync();
    };
    const handleOffline = () => {
      setConnection("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [performSync]);

  // Sync on app focus / visibility change (when user returns to PWA)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        void performSync();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [performSync]);

  // Initial sync on mount
  useEffect(() => {
    if (navigator.onLine) {
      // Short delay to not block initial render
      const timer = setTimeout(() => void performSync(), 1500);
      return () => clearTimeout(timer);
    }
  }, [performSync]);

  // Request persistent storage on mount (best-effort)
  useEffect(() => {
    void requestPersistentStorage();
  }, []);

  return (
    <OfflineContext.Provider value={{ connection, sync, triggerSync }}>
      {children}
    </OfflineContext.Provider>
  );
}
