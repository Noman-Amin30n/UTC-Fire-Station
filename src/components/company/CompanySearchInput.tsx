"use client";

import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import Link from "next/link";
import type { CompanyDTO } from "@/types/company";
import { Input } from "@/components/ui/input";
import { CompanyResultCard } from "@/components/company/CompanyResultCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchStatus = "idle" | "loading" | "done" | "error";

export function CompanySearchInput({ totalCompanies }: { totalCompanies: number }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanyDTO[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const runSearch = useDebouncedCallback(async (value: string) => {
    if (value.trim().length < 2) {
      setResults([]);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch(`/api/companies/search?q=${encodeURIComponent(value)}`);
      if (!res.ok) throw new Error("Search request failed");
      const data: { results: CompanyDTO[] } = await res.json();
      setResults(data.results);
      setStatus("done");
    } catch {
      setResults([]);
      setStatus("error");
    }
  }, 200);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length >= 2) {
      setStatus("loading");
    } else {
      setStatus("idle");
      setResults([]);
    }
    runSearch(value);
  }

  useEffect(() => {
    inputRef.current?.focus();

    function handleGlobalKeydown(e: KeyboardEvent) {
      const isTypingElsewhere = document.activeElement !== inputRef.current;
      if (e.key === "/" && isTypingElsewhere) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        setQuery("");
        setResults([]);
        setStatus("idle");
      }
    }

    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, []);

  const [best, ...others] = results;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          {status === "loading" ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Search className="h-6 w-6" />
          )}
        </div>
        <Input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          placeholder="Enter company name or sector..."
          autoFocus
          className="h-16 pl-14 text-xl rounded-xl border-border/50 bg-background/50 shadow-sm transition-all focus:border-primary focus:ring-4 focus:ring-primary/20 placeholder:text-muted-foreground/60"
          aria-label="Company search"
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-border bg-muted px-2 text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span> K
          </kbd>
        </div>
      </div>

      <div aria-live="polite" className="space-y-6 min-h-[300px]">
        {status === "loading" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
            <Card className="border-border/60 overflow-hidden shadow-sm bg-card/50">
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-2/5 min-w-[200px] rounded-lg" />
                  <Skeleton className="h-5 w-3/5 min-w-[250px] rounded-md" />
                </div>

                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border/40 bg-muted/40 flex flex-col items-center justify-center">
                  <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
                  <div className="relative z-10 flex flex-col items-center justify-center text-muted-foreground/60">
                    <MapPin className="h-8 w-8 animate-bounce opacity-40 mb-1" />
                    <span className="text-xs font-medium tracking-wider uppercase">Loading location details...</span>
                  </div>
                </div>

                <Skeleton className="h-12 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </CardContent>
            </Card>

            <div className="space-y-2 pt-2">
              <Skeleton className="h-3 w-36 rounded" />
              <div className="grid gap-2">
                <div className="h-16 w-full rounded-lg border border-border/40 bg-card/40 p-4 flex items-center justify-between">
                  <div className="space-y-2 w-3/4">
                    <Skeleton className="h-4 w-1/3 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <div className="h-16 w-full rounded-lg border border-border/40 bg-card/40 p-4 flex items-center justify-between">
                  <div className="space-y-2 w-3/4">
                    <Skeleton className="h-4 w-2/5 rounded" />
                    <Skeleton className="h-3 w-3/5 rounded" />
                  </div>
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        {status === "idle" && query.trim().length === 0 && (
          <div className="flex flex-col items-center justify-center pt-12 text-center opacity-70">
            <p className="text-lg text-muted-foreground">
              Instant access to <strong className="text-foreground">{totalCompanies}</strong> registered companies.
            </p>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Search by name, zone, or address for emergency response and dispatch details.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center text-destructive">
            <p className="font-medium">Search temporarily unavailable</p>
            <p className="text-sm opacity-80">Please check your connection and try again.</p>
          </div>
        )}

        {status === "done" && results.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">No matches found for &ldquo;{query}&rdquo;</p>
            <p className="mt-1 text-muted-foreground">
              Check for spelling errors or{" "}
              <Link href="/companies" className="text-primary hover:underline underline-offset-4">
                browse the full list
              </Link>.
            </p>
          </div>
        )}

        {status === "done" && best && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
            <CompanyResultCard company={best} />
            {others.length > 0 && (
              <div className="space-y-2 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Other possible matches
                </p>
                <div className="grid gap-2">
                  {others.map((company) => (
                    <button
                      key={company._id}
                      type="button"
                      onClick={() => {
                        setResults([company, ...results.filter((c) => c._id !== company._id)]);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group flex w-full items-center justify-between rounded-lg border border-border/40 bg-card px-4 py-3 text-left shadow-sm transition-all hover:border-primary/40 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <div>
                        <p className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                          {company.name}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{company.address}</p>
                      </div>
                      <div className="text-muted-foreground group-hover:translate-x-1 transition-transform">
                        →
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}