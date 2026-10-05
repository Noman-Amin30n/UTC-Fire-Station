/**
 * UTCDispatchDB — Dexie (IndexedDB) database for offline-first operation.
 *
 * Design decisions:
 * - Full snapshot sync (dataset is small: one collection of companies).
 * - Atomic transactions: entire sync completes or rolls back.
 * - Versioned schema: future migrations add new db.version() calls.
 * - Never stores passwords, tokens, or authentication data.
 *
 * Schema v1:
 *   companies  — all company records for offline lookup and search
 *   syncMeta   — singleton record tracking last successful sync
 */

// Dexie only runs in the browser. Guard against SSR imports.
import type { OfflineCompany, SyncMeta } from "@/types/offline";

let db: import("dexie").Dexie & {
  companies: import("dexie").Table<OfflineCompany, string>;
  syncMeta: import("dexie").Table<SyncMeta, number>;
} | null = null;

export async function getDB() {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }

  if (db) return db;

  const Dexie = (await import("dexie")).default;

  const instance = new Dexie("UTCDispatchDB") as import("dexie").Dexie & {
    companies: import("dexie").Table<OfflineCompany, string>;
    syncMeta: import("dexie").Table<SyncMeta, number>;
  };

  /**
   * Version 1 — initial schema
   * companies: indexed by _id (primary key), searchName and name for fast lookups
   * syncMeta: single record (id=1), primary key is number
   */
  instance.version(1).stores({
    companies: "_id, searchName, name, updatedAt",
    syncMeta: "id",
  });

  /**
   * Future migrations: add instance.version(2).stores({...}).upgrade(tx => {...})
   * Never drop existing tables without a migration path.
   */

  db = instance;
  return db;
}

/**
 * Check if IndexedDB is available and writable.
 * Returns false gracefully on Safari private mode, quota exceeded, etc.
 */
export async function isOfflineStorageAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const testDb = await getDB();
    // Simple ping — check that we can read syncMeta
    await testDb.syncMeta.get(1);
    return true;
  } catch {
    return false;
  }
}

/** Request persistent storage (best-effort, not guaranteed) */
export async function requestPersistentStorage(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!navigator.storage?.persist) return;
  try {
    const persisted = await navigator.storage.persisted();
    if (!persisted) {
      await navigator.storage.persist();
    }
  } catch {
    // Ignore — persistence is a best-effort hint
  }
}

/**
 * Atomically replace all companies and update syncMeta in a single transaction.
 * If any step fails, the entire transaction is rolled back.
 * The existing data remains intact if the transaction fails.
 */
export async function atomicSyncReplace(
  companies: OfflineCompany[],
  syncVersion: string
): Promise<void> {
  const database = await getDB();

  await database.transaction("rw", database.companies, database.syncMeta, async () => {
    // Clear and bulk-insert companies atomically
    await database.companies.clear();
    await database.companies.bulkPut(companies);

    // Update sync metadata
    await database.syncMeta.put({
      id: 1,
      lastSyncedAt: new Date().toISOString(),
      syncVersion,
      status: "success",
      errorMessage: null,
    });
  });
}

/**
 * Get the current sync metadata (or null if not yet synced).
 */
export async function getSyncMeta(): Promise<SyncMeta | null> {
  try {
    const database = await getDB();
    const meta = await database.syncMeta.get(1);
    return meta ?? null;
  } catch {
    return null;
  }
}

/**
 * Search companies offline using pre-computed searchName index.
 * Filters by normalized search term substring.
 */
export async function searchCompaniesOffline(
  normalizedQuery: string,
  limit = 10
): Promise<OfflineCompany[]> {
  const database = await getDB();
  if (!normalizedQuery.trim()) return [];
  // Dexie indexed range for substring search
  const all = await database.companies
    .where("searchName")
    .startsWith(normalizedQuery)
    .limit(limit)
    .toArray();
  // If startsWith returns fewer than limit, also search with filter for mid-word matches
  if (all.length < limit) {
    const additional = await database.companies
      .filter((c) => c.searchName.includes(normalizedQuery) && !all.some((a) => a._id === c._id))
      .limit(limit - all.length)
      .toArray();
    return [...all, ...additional];
  }
  return all;
}

/**
 * Get a single company by ID from the offline cache.
 */
export async function getCompanyOffline(id: string): Promise<OfflineCompany | null> {
  try {
    const database = await getDB();
    const company = await database.companies.get(id);
    return company ?? null;
  } catch {
    return null;
  }
}

/**
 * Get all companies from the offline cache.
 */
export async function getAllCompaniesOffline(): Promise<OfflineCompany[]> {
  try {
    const database = await getDB();
    return await database.companies.orderBy("name").toArray();
  } catch {
    return [];
  }
}

/**
 * Get total count of cached companies.
 */
export async function getOfflineCompanyCount(): Promise<number> {
  try {
    const database = await getDB();
    return await database.companies.count();
  } catch {
    return 0;
  }
}
