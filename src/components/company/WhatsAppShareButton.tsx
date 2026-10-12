"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { MessageCircle, Copy, MapPin } from "lucide-react";
import type { CompanyDTO } from "@/types/company";
import { formatCompanyMessage, buildWhatsAppUrl, type UserCoords } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

export function WhatsAppShareButton({ company }: { company: CompanyDTO }) {
  const [isSharing, setIsSharing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const userCoordsRef = useRef<UserCoords | undefined>(undefined);

  useEffect(() => {
    setIsMounted(true);

    // Silently request geolocation so we can embed accurate coordinates into
    // the directions link. We store the result in a ref (not state) to avoid
    // an extra re-render — we only need it at share-time.
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          userCoordsRef.current = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
        },
        () => {
          // Permission denied or unavailable — fallback gracefully; the
          // directions link will still work, Google will prompt for location.
          userCoordsRef.current = undefined;
        },
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
      );
    }
  }, []);

  function getMessage() {
    return formatCompanyMessage(company, userCoordsRef.current);
  }

  async function handleNativeShare() {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({ text: getMessage() });
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
      await navigator.clipboard.writeText(getMessage());
      toast.success("Details copied — paste into WhatsApp");
    } catch {
      toast.error("Couldn't copy — clipboard access denied");
    }
  }

  function handleOpenWhatsApp() {
    window.open(buildWhatsAppUrl(getMessage()), "_blank", "noopener,noreferrer");
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
        <Button type="button" className="w-full cursor-pointer" onClick={handleNativeShare} disabled={isSharing}>
          <MessageCircle className="mr-2 size-4" />
          {isSharing ? "Opening share sheet…" : "Share to WhatsApp"}
        </Button>
        <button
          type="button"
          onClick={handleCopyDetails}
          className="w-full cursor-pointer text-center text-xs text-muted-foreground underline underline-offset-2"
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