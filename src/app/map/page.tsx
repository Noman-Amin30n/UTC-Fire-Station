import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCompanyById } from "@/lib/companies";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const id = params.id as string | undefined;

  let company = null;
  if (id) {
    try {
      company = await getCompanyById(id);
    } catch {
      company = null;
    }
  }

  const title = company ? `${company.name} — Location Map` : "Company Location Map";
  const description = company
    ? `View the location of ${company.name} on the map.`
    : "View this company location on the map.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      // Absolute URL so WhatsApp/Telegram scrapers can fetch this image
      images: [
        {
          url: "/map/opengraph-image.jpg",
          width: 1024,
          height: 1024,
          alt: "Company Location Map",
        },
      ],
    },
  };
}

export default async function MapPage({ searchParams }: Props) {
  const params = await searchParams;
  const id = params.id as string | undefined;

  let company = null;
  if (id) {
    try {
      company = await getCompanyById(id);
    } catch {
      // Invalid ObjectId format or DB error — treat as not found
      company = null;
    }
  }

  const mapURL = company?.googleMapsUrl;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-foreground">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-tight">
              {company ? company.name : "Location Map"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {company ? company.address : "Interactive location view"}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild className="group shrink-0">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </Link>
        </Button>
      </div>

      {/* Map */}
      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
        {mapURL ? (
          <div className="relative w-full" style={{ paddingBottom: "56.25%" /* 16:9 */ }}>
            <iframe
              src={mapURL}
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={company ? `Map to ${company.name}` : "Google Maps Location"}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center aspect-video bg-muted/50 p-8 text-center space-y-4">
            <MapPin className="h-12 w-12 text-muted-foreground opacity-50" />
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-foreground">No Map Available</h2>
              <p className="text-sm text-muted-foreground max-w-[400px]">
                {id
                  ? "This company does not have a map link configured, or the link is invalid."
                  : "The link you opened is missing the company ID. Please use a valid share link."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Address detail */}
      {company?.address && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/40 text-sm">
          <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <p className="text-foreground">{company.address}</p>
        </div>
      )}
    </div>
  );
}
