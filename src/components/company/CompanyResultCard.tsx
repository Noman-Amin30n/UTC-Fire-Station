import { EmbeddedMap } from "@/components/company/EmbeddedMap";
import type { CompanyDTO } from "@/types/company";
import { Card, CardContent } from "@/components/ui/card";
import { WhatsAppShareButton } from "@/components/company/WhatsAppShareButton";

export function CompanyResultCard({ company }: { company: CompanyDTO }) {
  return (
    <Card className="border-primary">
      <CardContent className="space-y-4 pt-6">
        <div>
          <h2 className="text-2xl font-bold">{company.name}</h2>
          <p className="mt-1 text-lg text-muted-foreground">{company.address}</p>
        </div>

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

        {company.notes && (
          <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{company.notes}</p>
        )}

        <WhatsAppShareButton company={company} />
      </CardContent>
    </Card>
  );
}