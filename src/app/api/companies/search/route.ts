import { NextResponse, type NextRequest } from "next/server";
import { getAllCompanies } from "@/lib/companies";
import { searchCompanies } from "@/lib/search";
import { searchQuerySchema } from "@/schemas/search.schema";

export async function GET(request: NextRequest) {
  const parsed = searchQuerySchema.safeParse({
    q: request.nextUrl.searchParams.get("q") ?? "",
  });

  if (!parsed.success || parsed.data.q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const companies = await getAllCompanies();
    const results = searchCompanies(parsed.data.q, companies);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("Search failed:", err);
    return NextResponse.json({ error: "Search temporarily unavailable" }, { status: 503 });
  }
}