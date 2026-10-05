/**
 * Synchronization engine for UTC Emergency Dispatch offline-first PWA.
 *
 * Strategy: Full snapshot sync (dataset is small).
 * - Fetches all companies from /api/offline/snapshot
 * - Validates the response with Zod
 * - Atomically replaces IndexedDB via Dexie transaction
 * - Rolls back if any step fails — existing offline data is preserved
 *
 * Sync triggers (called from OfflineProvider):
 * 1. App startup (if online)
 * 2. window.addEventListener("online")
 * 3. document.visibilityState === "visible"
 * 4. Manual "Sync Now" button
 *
 * IMPORTANT: navigator.onLine alone is not trusted.
 * Real connectivity is confirmed only when the snapshot fetch succeeds.
 */

import { z } from "zod";
import { atomicSyncReplace, isOfflineStorageAvailable } from "@/lib/offline/database";
import type { SnapshotResponse, OfflineCompany } from "@/types/offline";

// ---------------------------------------------------------------------------
// Zod schema — validate snapshot before writing to IndexedDB
// ---------------------------------------------------------------------------
const offlineCompanySchema = z.object({
  _id: z.string().min(1),
  name: z.string(),
  searchName: z.string(),
  address: z.string(),
  imageUrl: z.string(),
  imagePublicId: z.string(),
  googleMapsUrl: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  contactPerson: z.string().optional(),
  companyCode: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const snapshotResponseSchema = z.object({
  success: z.literal(true),
  version: z.string().min(1),
  companies: z.array(offlineCompanySchema),
});

// ---------------------------------------------------------------------------
// Sync result
// ---------------------------------------------------------------------------
export type SyncResult =
  | { ok: true; companyCount: number; version: string }
  | { ok: false; reason: "offline" | "auth" | "server" | "storage" | "invalid" | "timeout"; message: string };

// ---------------------------------------------------------------------------
// Cooldown — prevent sync spam (30-second minimum between syncs)
// ---------------------------------------------------------------------------
let lastSyncAttemptMs = 0;
const SYNC_COOLDOWN_MS = 30_000;

export function resetSyncCooldown() {
  lastSyncAttemptMs = 0;
}

// ---------------------------------------------------------------------------
// Main sync function
// ---------------------------------------------------------------------------
const SNAPSHOT_URL = "/api/offline/snapshot";
const SYNC_TIMEOUT_MS = 30_000;

export async function syncOfflineData(options?: { force?: boolean }): Promise<SyncResult> {
  // Check IndexedDB availability
  const storageAvailable = await isOfflineStorageAvailable();
  if (!storageAvailable) {
    return { ok: false, reason: "storage", message: "Offline storage is unavailable on this device" };
  }

  // Cooldown check (unless force)
  if (!options?.force) {
    const now = Date.now();
    if (now - lastSyncAttemptMs < SYNC_COOLDOWN_MS) {
      // Silently skip — not an error, just rate-limited
      return { ok: false, reason: "offline", message: "Sync cooldown active — try again shortly" };
    }
  }
  lastSyncAttemptMs = Date.now();

  // Attempt network fetch
  let response: Response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);

    response = await fetch(SNAPSHOT_URL, {
      method: "GET",
      credentials: "same-origin",
      headers: { "Accept": "application/json", "Cache-Control": "no-cache" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    if (message.includes("abort") || message.includes("timeout")) {
      return { ok: false, reason: "timeout", message: "Sync timed out — server may be slow" };
    }
    return { ok: false, reason: "offline", message: "Device appears to be offline" };
  }

  // Handle HTTP errors
  if (response.status === 401 || response.status === 403) {
    return { ok: false, reason: "auth", message: "Authentication required to sync" };
  }
  if (!response.ok) {
    return { ok: false, reason: "server", message: `Server error: ${response.status}` };
  }

  // Parse and validate
  let raw: unknown;
  try {
    raw = await response.json();
  } catch {
    return { ok: false, reason: "invalid", message: "Server returned invalid JSON" };
  }

  const parsed = snapshotResponseSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("Snapshot validation failed:", parsed.error.flatten());
    return { ok: false, reason: "invalid", message: "Server returned unexpected data format" };
  }

  const snapshot: SnapshotResponse = parsed.data as SnapshotResponse;

  // Atomically write to IndexedDB
  try {
    await atomicSyncReplace(snapshot.companies as OfflineCompany[], snapshot.version);
  } catch (err) {
    console.error("IndexedDB write failed:", err);
    return { ok: false, reason: "storage", message: "Failed to save offline data — storage may be full" };
  }

  return {
    ok: true,
    companyCount: snapshot.companies.length,
    version: snapshot.version,
  };
}
