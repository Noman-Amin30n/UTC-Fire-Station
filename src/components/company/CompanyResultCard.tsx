import { DraggableImage } from "@/components/company/DraggableImage";
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

        <DraggableImage src={company.imageUrl} alt={`Map to ${company.name}`} />

        {company.notes && (
          <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">{company.notes}</p>
        )}

        <WhatsAppShareButton company={company} />
      </CardContent>
    </Card>
  );
}