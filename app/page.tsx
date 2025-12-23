"use client";

import { useActiveExhibition } from "@/hooks/useGalleryData";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomableImage } from "@/components/gallery/ZoomableImage";
import { ChevronLeft, ChevronRight, Info, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GalleryPage() {
  const exhibition = useActiveExhibition();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showInfo, setShowInfo] = useState(false); // Can default to true or false

  // Keyboard navigation
  useEffect(() => {
    if (!exhibition?.artworks) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        const newIndex = index + 1;
        if (newIndex < exhibition.artworks.length) {
          setDirection(1);
          setIndex(newIndex);
        }
      }
      if (e.key === "ArrowLeft") {
        const newIndex = index - 1;
        if (newIndex >= 0) {
          setDirection(-1);
          setIndex(newIndex);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, exhibition]);

  // If no exhibition active
  if (exhibition === undefined) return (
    <div className="h-screen bg-background flex flex-col items-center justify-center text-muted-foreground gap-4 border-4 border-black">
      <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      <p className="font-mono uppercase tracking-widest">Loading...</p>
    </div>
  );
  if (exhibition === null) return (
    <div className="h-screen bg-background flex flex-col items-center justify-center text-foreground gap-8 border-4 border-black p-8">
      <div className="border-4 border-black p-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">No Signal</h1>
        <p className="font-mono text-sm max-w-md">
          No active exhibition found. Please access the administration panel to configure the display.
        </p>
      </div>
      <a href="/admin" className="px-8 py-3 bg-black text-white hover:bg-neutral-800 font-mono text-sm">
        GOTO: ADMIN //
      </a>
    </div>
  );

  const artworks = exhibition.artworks;
  const currentArtwork = artworks[index];

  const paginate = (newDirection: number) => {
    const newIndex = index + newDirection;
    if (newIndex >= 0 && newIndex < artworks.length) {
      setDirection(newDirection);
      setIndex(newIndex);
    }
  };

  return (
    <div className="relative h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col font-sans">
      {/* Main Image Area */}
      <div className="flex-1 relative border-b-4 border-black box-border overflow-hidden touch-pan-y">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={{
              enter: (direction: number) => ({
                x: direction > 0 ? "100%" : "-100%",
              }),
              center: {
                x: 0,
              },
              exit: (direction: number) => ({
                x: direction < 0 ? "100%" : "-100%",
                zIndex: 0
              })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "tween", ease: [0.32, 0.72, 0, 1], duration: 0.75 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.x;

              if (swipe < -50) {
                paginate(1);
              } else if (swipe > 50) {
                paginate(-1);
              }
            }}
            className="absolute inset-0 bg-[#F5F4F0] z-10"
          >
            <ZoomableImage
              src={currentArtwork.imageUrl}
              alt={currentArtwork.title}
              isActive={true}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Zones - Hidden but clickable for desktop/tap */}
        <div
          className="absolute inset-y-0 left-0 w-1/6 z-20 cursor-w-resize"
          onClick={() => paginate(-1)}
        />
        <div
          className="absolute inset-y-0 right-0 w-1/6 z-20 cursor-e-resize"
          onClick={() => paginate(1)}
        />
      </div>

      {/* Brutalist Footer / Metadata */}
      {/* Always visible or toggled? User said "on peut pas voir", so let's make a dedicated section at bottom */}

      <div className="flex-shrink-0 h-32 md:h-24 border-t-4 border-black bg-background flex items-center justify-between px-8 relative z-30">
        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter">{currentArtwork.title}</h2>
          <div className="flex items-center gap-4 font-mono text-sm border-l-2 border-black pl-4">
            <span className="font-bold">{currentArtwork.artist}</span>
          </div>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className={cn(
            "px-4 py-2 border-2 border-black font-mono text-xs uppercase hover:bg-black hover:text-white transition-colors",
            showInfo ? "bg-black text-white" : "bg-transparent text-black"
          )}
        >
          {showInfo ? "Info [-]" : "Info [+]"}
        </button>
      </div>

      {/* Detailed Info Drawer */}
      <div className={cn(
        "absolute bottom-32 md:bottom-24 left-0 w-full md:w-auto md:max-w-md bg-white border-4 border-l-0 md:border-l-4 border-black p-6 transition-transform duration-300 z-50",
        showInfo ? "translate-y-0" : "translate-y-[150%]"
      )}>
        <div className="relative space-y-4 font-mono text-sm text-black">
          {/* Decorative Triangles */}
          <div className="absolute -top-3 -left-3 w-0 h-0 border-t-[8px] border-t-red-500 border-r-[8px] border-r-transparent" />
          <div className="absolute -bottom-3 -right-3 w-0 h-0 border-b-[8px] border-b-red-500 border-l-[8px] border-l-transparent" />

          <div className="grid grid-cols-2 gap-4 border-b-2 border-dashed border-black pb-4">
            <div className="opacity-60">Year</div>
            <div className="font-bold text-right">{currentArtwork.year || "N/A"}</div>
            <div className="opacity-60">Medium</div>
            <div className="font-bold text-right">{currentArtwork.medium || "N/A"}</div>
            <div className="opacity-60">Dimensions</div>
            <div className="font-bold text-right">{currentArtwork.dimensions || "N/A"}</div>
          </div>

          <div className="border-b-2 border-dashed border-black pb-4">
            <div className="opacity-60 mb-2">About</div>
            <p className="leading-relaxed whitespace-pre-wrap">
              {currentArtwork.description ? currentArtwork.description : "No description available."}
            </p>
          </div>

          {/* Logo in drawer as well? */}
          <div className="pt-2 flex justify-between items-center">
            <span className="text-[10px] text-gray-400">v2.5</span>
            <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain grayscale" />
          </div>
        </div>
      </div>

      {/* Floating Navigation Arrows (Brutalist Style) */}
      <button
        className={cn("absolute left-0 top-1/2 -translate-y-1/2 bg-white border-y-4 border-r-4 border-black p-4 hover:bg-black hover:text-white transition-all z-20", index === 0 && "opacity-0 pointer-events-none")}
        onClick={() => paginate(-1)}
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        className={cn("absolute right-0 top-1/2 -translate-y-1/2 bg-white border-y-4 border-l-4 border-black p-4 hover:bg-black hover:text-white transition-all z-20", index === artworks.length - 1 && "opacity-0 pointer-events-none")}
        onClick={() => paginate(1)}
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Top Left Branding */}
      <div className="absolute top-0 left-0 p-6 z-20 pointer-events-none flex flex-col items-start gap-2">
        <div className="bg-white border-4 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
        </div>
        <div className="bg-black text-white px-2 py-1 font-mono text-xs uppercase tracking-widest mt-2">
          {exhibition.title}
        </div>
      </div>

      {/* Counter (Top Right) */}
      <div className="absolute top-6 right-6 z-20 pointer-events-none">
        <div className="bg-white border-4 border-black px-4 py-2 font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {String(index + 1).padStart(2, '0')} / {String(artworks.length).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}
