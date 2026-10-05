/**
 * Offline-first type definitions for UTC Emergency Dispatch.
 * These types model the local IndexedDB schema and sync-related state.
 */

/** Mirrors CompanyDTO stored in IndexedDB */
export type OfflineCompany = {
  _id: string;
  name: string;
  searchName: string;
  address: string;
  imageUrl: string;
  imagePublicId: string;
  googleMapsUrl?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  companyCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

/** Sync metadata stored in IndexedDB (key=1 record) */
export type SyncMeta = {
  id: number; // always 1 — singleton record
  lastSyncedAt: string | null; // ISO timestamp of last successful sync
  syncVersion: string | null; // snapshot version from server
  status: "idle" | "syncing" | "success" | "error";
  errorMessage: string | null;
};

/** Server snapshot response from GET /api/offline/snapshot */
export type SnapshotResponse = {
  success: true;
  version: string; // ISO timestamp used as server snapshot identifier
  companies: OfflineCompany[];
};

/** Union type for sync operation status */
export type SyncStatus =
  | { state: "idle" }
  | { state: "syncing" }
  | { state: "success"; lastSyncedAt: string }
  | { state: "error"; errorMessage: string; lastSyncedAt: string | null };

/** Connection status */
export type ConnectionStatus = "online" | "offline" | "unknown";
