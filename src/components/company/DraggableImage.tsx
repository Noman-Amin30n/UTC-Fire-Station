"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Move, RotateCcw, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DraggableImageProps {
  src: string;
  alt: string;
}

export function DraggableImage({ src, alt }: DraggableImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  
  // Track visual pan offsets
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [startPanX, setStartPanX] = useState(0);
  const [startPanY, setStartPanY] = useState(0);

  // Zoom
  const [zoom, setZoom] = useState(1);

  const startDragging = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    
    if ('touches' in e) {
      setStartX(e.touches[0].pageX);
      setStartY(e.touches[0].pageY);
    } else {
      setStartX(e.pageX);
      setStartY(e.pageY);
    }
    
    setStartPanX(panX);
    setStartPanY(panY);
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const onDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].pageX;
      y = e.touches[0].pageY;
    } else {
      e.preventDefault(); // prevent image ghost dragging on desktop
      x = e.pageX;
      y = e.pageY;
    }
    
    // Scale panning speed based on zoom so it feels natural
    const walkX = (x - startX) / zoom;
    const walkY = (y - startY) / zoom;
    
    setPanX(startPanX + walkX);
    setPanY(startPanY + walkY);
  };

  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3 flex-1">
          <ZoomIn className="h-4 w-4 text-muted-foreground" />
          <input 
            type="range" 
            min="1" 
            max="3" 
            step="0.1" 
            value={zoom} 
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-muted accent-primary" 
          />
          <span className="text-xs font-medium w-8 text-right text-muted-foreground">{Math.round(zoom * 100)}%</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="h-8 gap-1.5" disabled={zoom === 1 && panX === 0 && panY === 0}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      <div className="relative group rounded-lg border border-border shadow-inner bg-muted overflow-hidden">
        <div className="absolute top-2 right-2 z-10 bg-background/60 text-foreground p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-sm border border-border">
          <Move className="w-4 h-4" />
        </div>
        
        <div
          ref={containerRef}
          className={`relative aspect-video w-full overflow-hidden ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } touch-none`}
          onMouseDown={startDragging}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          onMouseMove={onDrag}
          onTouchStart={startDragging}
          onTouchEnd={stopDragging}
          onTouchMove={onDrag}
        >
          <div className="relative w-full h-full pointer-events-none select-none transition-transform duration-75 ease-out" style={{
            transform: `scale(${zoom})`
          }}>
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover"
              style={{ objectPosition: `calc(50% + ${panX}px) calc(50% + ${panY}px)` }}
              sizes="(max-width: 1024px) 100vw, 100vw"
              priority
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
