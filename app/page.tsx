"use client";

import { useActiveExhibition } from "@/hooks/useGalleryData";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomableImage } from "@/components/gallery/ZoomableImage";
import { HomeMenu } from "@/components/gallery/HomeMenu";
import { ChevronLeft, ChevronRight, Info, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GalleryPage() {
  const exhibition = useActiveExhibition();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showInfo, setShowInfo] = useState(false); // Can default to true or false
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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
      if (e.key === "Escape") {
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, exhibition, isExpanded]);

  // If no exhibition active
  if (exhibition === undefined) return (
    <div className="h-screen bg-background flex flex-col items-center justify-center text-muted-foreground gap-4 border-4 border-black">
      <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      <p className="font-oswald uppercase tracking-widest">Loading...</p>
    </div>
  );
  if (exhibition === null) return (
    <div className="h-screen bg-background flex flex-col items-center justify-center text-foreground gap-8 border-4 border-black p-8">
      <div className="border-4 border-black p-8">
        <h1 className="text-4xl font-oswald font-black uppercase tracking-tighter mb-4">No Signal</h1>
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
      setIsExpanded(false); // Reset zoom on slide change
    }
  };

  return (
    <div className="relative h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col font-sans">
      {/* Main Image Area */}
      <div className="flex-1 relative overflow-hidden touch-pan-y">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={{
              enter: (direction: number) => ({
                x: direction > 0 ? "100%" : "-100%",
                scale: 0.95,
                opacity: 0
              }),
              center: {
                x: 0,
                scale: 1,
                opacity: 1
              },
              exit: (direction: number) => ({
                x: direction < 0 ? "100%" : "-100%",
                scale: 0.95,
                opacity: 0,
                zIndex: 0
              })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 }
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
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          >
            {/* Frameless Image Container */}
            <motion.div
              layout
              initial={{ padding: "2rem" }} // p-8 equivalent
              animate={{
                padding: isExpanded ? "0rem" : (window.innerWidth >= 768 ? "8rem" : "2rem") // 0 or p-32/p-8
              }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }} // Apple-style ease
              className="w-full h-full flex items-center justify-center pointer-events-auto"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className={cn("relative w-full h-full flex items-center justify-center transition-transform", isExpanded ? "cursor-auto" : "cursor-zoom-in")}>
                <ZoomableImage
                  src={currentArtwork.imageUrl}
                  alt={currentArtwork.title}
                  isActive={true}
                  isZoomEnabled={isExpanded}
                />
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Zones - Hidden but clickable for desktop/tap */}
        {!isExpanded && ( // Disable navigation zones in full screen to avoid accidental swipes
          <>
            <div
              className="absolute inset-y-0 left-0 w-1/6 z-20 cursor-w-resize"
              onClick={() => paginate(-1)}
            />
            <div
              className="absolute inset-y-0 right-0 w-1/6 z-20 cursor-e-resize"
              onClick={() => paginate(1)}
            />
          </>
        )}
      </div>

      {/* Footer / Metadata - Minimalist */}
      {/* Hide footer in expanded mode for full immersion */}
      <div className={cn(
        "flex-shrink-0 h-24 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 relative z-30 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] transition-transform duration-500",
        isExpanded ? "translate-y-full" : "translate-y-0"
      )}>
        <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4">
          <h2 className="text-3xl uppercase font-oswald tracking-tight text-neutral-900">{currentArtwork.title}</h2>
          <span className="text-neutral-500 font-normal font-sans tracking-wide">{currentArtwork.artist}</span>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300",
            showInfo ? "bg-neutral-100 text-neutral-900" : "bg-transparent text-neutral-500 hover:bg-neutral-50"
          )}
        >
          {showInfo ? <X className="w-5 h-5" /> : <Info className="w-5 h-5" />}
        </button>
      </div>

      {/* Detailed Info Drawer - Apple Style (Floating Card) */}
      <div className={cn(
        "absolute bottom-28 right-8 w-full md:max-w-sm bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl transition-all duration-500 z-50 origin-bottom-right transform",
        showInfo ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
      )}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div>
              <div className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Year</div>
              <div className="font-medium">{currentArtwork.year || "N/A"}</div>
            </div>
            <div>
              <div className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Medium</div>
              <div className="font-medium">{currentArtwork.medium || "N/A"}</div>
            </div>
            <div className="col-span-2">
              <div className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Dimensions</div>
              <div className="font-medium">{currentArtwork.dimensions || "N/A"}</div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100">
            <div className="text-neutral-400 text-xs uppercase tracking-wide mb-2">About</div>
            <p className="text-neutral-600 leading-relaxed text-sm whitespace-pre-wrap">
              {currentArtwork.description ? currentArtwork.description : "No description available."}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Navigation Arrows (Minimalist) */}
      <button
        className={cn("absolute left-4 top-1/2 -translate-y-1/2 p-4 text-neutral-400 hover:text-neutral-900 transition-colors z-20", index === 0 && "opacity-0 pointer-events-none", isExpanded && "opacity-0 pointer-events-none")}
        onClick={() => paginate(-1)}
      >
        <ChevronLeft className="w-8 h-8 drop-shadow-md" />
      </button>
      <button
        className={cn("absolute right-4 top-1/2 -translate-y-1/2 p-4 text-neutral-400 hover:text-neutral-900 transition-colors z-20", index === artworks.length - 1 && "opacity-0 pointer-events-none", isExpanded && "opacity-0 pointer-events-none")}
        onClick={() => paginate(1)}
      >
        <ChevronRight className="w-8 h-8 drop-shadow-md" />
      </button>

      {/* Top Left Branding - Nude & Shadow */}
      <div
        className={cn("absolute top-0 left-0 p-8 z-20 flex flex-col items-start gap-1 transition-opacity duration-300 pointer-events-auto cursor-pointer", isExpanded ? "opacity-0" : "opacity-100")}
        onClick={() => setShowMenu(true)}
      >
        <img
          src="/logo.png"
          alt="Logo"
          className="w-48 h-auto object-contain drop-shadow-xl"
        />
        <div className="text-neutral-400 text-xs uppercase tracking-wider pl-1 font-medium hidden">
          {exhibition.title}
        </div>
      </div>

      {/* Counter (Minimalist) */}
      <div className={cn("absolute top-8 right-8 z-20 pointer-events-none transition-opacity duration-300", isExpanded ? "opacity-0" : "opacity-100")}>
        <div className="text-neutral-400 font-medium text-sm tracking-widest font-oswald">
          {String(index + 1).padStart(2, '0')} / {String(artworks.length).padStart(2, '0')}
        </div>
      </div>

      {/* Full Screen Home Menu */}
      <AnimatePresence>
        {showMenu && (
          <HomeMenu
            isOpen={showMenu}
            onClose={() => setShowMenu(false)}
            exhibition={exhibition}
            artworks={artworks}
            onNavigate={(idx) => {
              setIndex(idx);
              setShowMenu(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
