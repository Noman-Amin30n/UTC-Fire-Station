interface EmbeddedMapProps {
  googleMapsUrl: string;
  title?: string;
}

export function EmbeddedMap({ googleMapsUrl, title = "Google Maps" }: EmbeddedMapProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border shadow-inner bg-muted aspect-video w-full">
      <iframe
        src={googleMapsUrl}
        title={title}
        width="100%"
        height="100%"
        style={{ border: 0, position: "absolute", inset: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
