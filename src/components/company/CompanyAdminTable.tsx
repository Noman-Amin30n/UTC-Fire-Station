"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { CompanyDTO } from "@/types/company";
import { deleteCompany } from "@/actions/company-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
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

export function CompanyAdminTable({ companies }: { companies: CompanyDTO[] }) {
  const [filter, setFilter] = useState("");

  const filtered = filter.trim()
    ? companies.filter((c) => c.searchName.includes(filter.trim().toLowerCase()))
    : companies;

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
      <Input placeholder="Filter companies…" value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-sm" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((company) => (
            <TableRow key={company._id}>
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell className="text-muted-foreground">{company.address}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/companies/${company._id}/edit`}>Edit</Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">Delete</Button>
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
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No companies match &quot;{filter}&quot;.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}