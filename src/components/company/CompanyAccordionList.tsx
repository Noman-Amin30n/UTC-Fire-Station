"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { CompanyDTO } from "@/types/company";
import { normalizeSearchName } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Search, MapPin, Info, PhoneCall } from "lucide-react";
import { WhatsAppShareButton } from "@/components/company/WhatsAppShareButton";
import { DraggableImage } from "@/components/company/DraggableImage";

export function CompanyAccordionList({ companies }: { companies: CompanyDTO[] }) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const normalized = normalizeSearchName(filter);
    if (!normalized) return companies;
    return companies.filter((c) => c.searchName.includes(normalized));
  }, [filter, companies]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search className="h-5 w-5" />
        </div>
        <Input
          placeholder="Filter companies by name or address..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-14 pl-12 text-lg rounded-xl border-border/50 bg-card/50 backdrop-blur-sm shadow-sm transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
          aria-label="Filter companies"
        />
      </div>

      <p aria-live="polite" className="sr-only">
        {filtered.length} of {companies.length} companies shown
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card/50 border-dashed border-border/60">
          <Search className="h-10 w-10 text-muted-foreground opacity-50 mb-4" />
          <p className="text-lg text-muted-foreground">No companies match &ldquo;<span className="text-foreground">{filter}</span>&rdquo;</p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {filtered.map((company) => (
            <AccordionItem 
              key={company._id} 
              value={company._id}
              className="border border-border/40 rounded-xl bg-card overflow-hidden shadow-sm data-[state=open]:border-primary/50 data-[state=open]:ring-1 data-[state=open]:ring-primary/20 transition-all"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-start text-left">
                  <span className="text-lg font-bold tracking-tight">{company.name}</span>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="mr-1 h-3.5 w-3.5 opacity-70" />
                    <span className="line-clamp-1">{company.address}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <div className="space-y-4">
                    <DraggableImage src={company.imageUrl} alt={`Map to ${company.name}`} />
                  </div>
                  
                  <div className="space-y-6 flex flex-col h-full">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        Full Address
                      </h4>
                      <p className="text-base font-medium text-foreground">{company.address}</p>
                    </div>

                    {company.notes && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center">
                          <Info className="mr-2 h-4 w-4" />
                          Emergency Notes
                        </h4>
                        <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-sm text-foreground">
                          {company.notes}
                        </div>
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-border/40">
                      <WhatsAppShareButton company={company} />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}