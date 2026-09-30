import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  itemName?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 8,
  itemName = "results",
  className,
}: PaginationProps) {
  // If no items, do not render pagination
  if (totalItems !== undefined && totalItems === 0) {
    return null;
  }

  // Calculate items range
  const startItem = totalItems !== undefined && totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 1;
  const endItem =
    totalItems !== undefined ? Math.min(currentPage * pageSize, totalItems) : currentPage * pageSize;

  // Build page numbers list with ellipsis
  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
  };

  const pages = getPageNumbers();

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-1",
        className
      )}
    >
      {/* Item count text */}
      {totalItems !== undefined ? (
        <p className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
          Showing <span className="font-semibold text-foreground">{startItem}</span> to{" "}
          <span className="font-semibold text-foreground">{endItem}</span> of{" "}
          <span className="font-semibold text-foreground">{totalItems}</span> {itemName}
        </p>
      ) : (
        <div className="order-2 sm:order-1" />
      )}

      {/* Page controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 order-1 sm:order-2">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            aria-label="Go to previous page"
            className="h-8 px-2.5 text-xs font-medium cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-0.5" />
            <span className="hidden xs:inline">Prev</span>
          </Button>

          {/* Mobile page indicator */}
          <div className="sm:hidden flex items-center px-2 text-xs font-medium text-muted-foreground">
            <span className="text-foreground font-semibold">{currentPage}</span>
            <span className="mx-1">/</span>
            <span>{totalPages}</span>
          </div>

          {/* Desktop page numbers */}
          <div className="hidden sm:flex items-center gap-1">
            {pages.map((p, idx) => {
              if (p === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="inline-flex h-8 w-8 items-center justify-center text-xs text-muted-foreground select-none"
                    aria-hidden="true"
                  >
                    …
                  </span>
                );
              }

              const isCurrent = p === currentPage;
              return (
                <Button
                  key={p}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(p)}
                  aria-label={`Go to page ${p}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "h-8 min-w-[2rem] px-2 text-xs font-medium transition-colors cursor-pointer",
                    isCurrent && "pointer-events-none shadow-xs"
                  )}
                >
                  {p}
                </Button>
              );
            })}
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Go to next page"
            className="h-8 px-2.5 text-xs font-medium cursor-pointer disabled:cursor-not-allowed"
          >
            <span className="hidden xs:inline">Next</span>
            <ChevronRight className="h-4 w-4 ml-0.5" />
          </Button>
        </div>
      )}
    </nav>
  );
}
