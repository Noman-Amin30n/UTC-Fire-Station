"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MessageCircle, Copy, MapPin } from "lucide-react";
import type { CompanyDTO } from "@/types/company";
import { formatCompanyMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

export function WhatsAppShareButton({ company }: { company: CompanyDTO }) {
  const [isSharing, setIsSharing] = useState(false);
  const message = formatCompanyMessage(company);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function handleNativeShare() {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({ text: message });
      } else {
        throw new Error("Web Share API unavailable");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return; // user cancelled
      toast.error("Native sharing isn't available on this browser — use Copy + Open WhatsApp below");
    } finally {
      setIsSharing(false);
    }
  }

  async function handleCopyDetails() {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Details copied — paste into WhatsApp");
    } catch {
      toast.error("Couldn't copy — clipboard access denied");
    }
  }

  function handleOpenWhatsApp() {
    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  }

  function handleOpenMap() {
    if (company.googleMapsUrl) {
      window.open(company.googleMapsUrl, "_blank", "noopener,noreferrer");
    }
  }

  const supportsNativeShare = isMounted && typeof navigator !== "undefined" && !!navigator.share;

  if (!isMounted) {
    return (
      <div className="h-10 w-full animate-pulse rounded-md bg-muted"></div>
    );
  }

  if (supportsNativeShare) {
    return (
      <div className="space-y-2">
        <Button type="button" className="w-full" onClick={handleNativeShare} disabled={isSharing}>
          <MessageCircle className="mr-2 size-4" />
          {isSharing ? "Opening share sheet…" : "Share to WhatsApp"}
        </Button>
        <button
          type="button"
          onClick={handleCopyDetails}
          className="w-full text-center text-xs text-muted-foreground underline underline-offset-2"
        >
          Or copy details manually
        </button>
      </div>
    );
  }

  return (
    <div className={`grid gap-2 ${company.googleMapsUrl ? "grid-cols-3" : "grid-cols-2"}`}>
      <Button type="button" variant="outline" onClick={handleCopyDetails}>
        <Copy className="mr-2 size-4" />
        Copy details
      </Button>
      <Button type="button" variant="outline" onClick={handleOpenWhatsApp}>
        <MessageCircle className="mr-2 size-4" />
        Open WhatsApp
      </Button>
      {company.googleMapsUrl && (
        <Button type="button" variant="outline" onClick={handleOpenMap}>
          <MapPin className="mr-2 size-4" />
          Open map
        </Button>
      )}
    </div>
  );
}