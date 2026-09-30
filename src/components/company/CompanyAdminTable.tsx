"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { CompanyDTO } from "@/types/company";
import { deleteCompany } from "@/actions/company-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export interface CompanyAdminTableProps {
  companies: CompanyDTO[];
  pageSize?: number;
}

export function CompanyAdminTable({ companies, pageSize = 8 }: CompanyAdminTableProps) {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => c.searchName.includes(q) || c.address?.toLowerCase().includes(q));
  }, [filter, companies]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, currentPage, pageSize]);

  async function handleDelete(id: string) {
    try {
      await deleteCompany(id, new FormData());
      toast.success("Company deleted");
    } catch {
      toast.error("Failed to delete company");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Filter companies by name or address…"
            value={filter}
            onChange={handleFilterChange}
            className="pl-9 h-10 bg-background/50"
            aria-label="Filter companies in admin table"
          />
        </div>
        {filter.trim() && (
          <p className="text-xs text-muted-foreground">
            Found <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "match" : "matches"}
          </p>
        )}
      </div>

      <div className="rounded-lg border border-border/50 overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Address</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCompanies.map((company) => (
              <TableRow key={company._id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-foreground">{company.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm text-truncate">{company.address}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button asChild variant="outline" size="sm" className="h-8">
                    <Link href={`/admin/companies/${company._id}/edit`}>Edit</Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="h-8">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {company.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently removes the company record and its company image. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(company._id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No companies match &quot;{filter}&quot;.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filtered.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          itemName="companies"
          className="pt-1"
        />
      )}
    </div>
  );
}