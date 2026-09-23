"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
import { Search, MapPin, Info, X, ZoomIn } from "lucide-react";
import { WhatsAppShareButton } from "@/components/company/WhatsAppShareButton";
import { EmbeddedMap } from "@/components/company/EmbeddedMap";

// ---------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(6px)",
        animation: "lbFadeIn 0.2s ease",
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close image"
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "50%",
          width: "2.5rem",
          height: "2.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
      >
        <X size={18} />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          borderRadius: "0.75rem",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
          animation: "lbScaleIn 0.2s ease",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          style={{ display: "block", maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }}
        />
      </div>

      <style>{`
        @keyframes lbFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes lbScaleIn { from { transform: scale(0.92); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// Main list
// ---------------------------------------------------------------------------
export function CompanyAccordionList({ companies }: { companies: CompanyDTO[] }) {
  const [filter, setFilter] = useState("");
  const [lightboxSrc, setLightboxSrc] = useState<{ src: string; alt: string } | null>(null);
  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

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
                    {company.googleMapsUrl ? (
                      <EmbeddedMap
                        googleMapsUrl={company.googleMapsUrl}
                        title={`Map to ${company.name}`}
                      />
                    ) : (
                      <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted text-sm text-muted-foreground">
                        No map available
                      </div>
                    )}
                  </div>

                  <div className="space-y-6 flex flex-col h-full">
                    {company.imageUrl && (
                      <button
                        type="button"
                        aria-label={`View full image of ${company.name}`}
                        onClick={() => setLightboxSrc({ src: company.imageUrl, alt: `${company.name} image` })}
                        className="group/img relative overflow-hidden rounded-lg border border-border/40 bg-muted transition-all hover:border-primary/50 hover:ring-2 hover:ring-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-zoom-in"
                        style={{ width: "150px" }}
                      >
                        <Image
                          src={company.imageUrl}
                          alt={`${company.name} image`}
                          width={150}
                          height={150}
                          className="w-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/img:bg-black/30 transition-colors duration-200">
                          <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 drop-shadow-lg" />
                        </div>
                      </button>
                    )}

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

      {lightboxSrc && (
        <Lightbox src={lightboxSrc.src} alt={lightboxSrc.alt} onClose={closeLightbox} />
      )}
    </div>
  );
}
