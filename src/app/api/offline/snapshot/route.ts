import { NextResponse } from "next/server";
import { getAllCompanies } from "@/lib/companies";

/**
 * GET /api/offline/snapshot
 *
 * Returns a full snapshot of all company data for offline storage.
 * This endpoint mirrors what /companies page already shows publicly —
 * no authentication required since company data is publicly accessible.
 *
 * Security: This endpoint returns only the same public company data
 * that is already visible on the /companies page. No sensitive data
 * (passwords, tokens, private user info) is included.
 *
 * Cache-Control: no-store to prevent SW from caching this response.
 * Data is intentionally stored in IndexedDB, not the SW cache.
 */
export async function GET() {
  try {
    const companies = await getAllCompanies();

    const version = new Date().toISOString();

    return NextResponse.json(
      {
        success: true,
        version,
        companies,
      },
      {
        headers: {
          // Prevent service worker and CDN from caching this response
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    );
  } catch (err) {
    console.error("Offline snapshot failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate offline snapshot" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
