"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Exhibition, Artwork } from "@/types";
import { cn } from "@/lib/utils";

interface HomeMenuProps {
    isOpen: boolean;
    onClose: () => void;
    exhibition: Exhibition;
    artworks: Artwork[];
    onNavigate: (index: number) => void;
}

export function HomeMenu({ isOpen, onClose, exhibition, artworks, onNavigate }: HomeMenuProps) {
    const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    // Deferred rendering to ensure modal opens instantly
    useEffect(() => {
        if (isOpen) {
            // Small timeout to allow animation frame to start before heavy React render
            const timer = setTimeout(() => setIsReady(true), 50);
            return () => clearTimeout(timer);
        } else {
            setIsReady(false);
        }
    }, [isOpen]);

    // Sort artists (opt)
    const artistsList = exhibition.artists || [];
    const hasMultipleArtists = artistsList.length > 0;

    // Derived state
    const currentArtist = selectedArtistId
        ? artistsList.find(a => a.id === selectedArtistId)
        : null;

    // Filter artworks
    const displayedArtworks = selectedArtistId && currentArtist
        ? artworks.filter(a => a.artist === currentArtist.name)
        : artworks;

    // Determine Bio & Photo to show
    // Priority: Selected Artist -> Exhibition Legacy Bio -> Hidden
    const activeBio = currentArtist ? currentArtist.bio : exhibition.artistBio;
    const activePhoto = currentArtist ? currentArtist.photoUrl : exhibition.artistPhotoUrl;
    const activeTitle = currentArtist ? currentArtist.name : exhibition.title;
    const activeSubtitle = currentArtist ? "Artist" : "Exhibition";

    if (!isOpen) return null;

    const today = new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "circOut" }}
            style={{ willChange: "transform, opacity" }}
            className="fixed inset-0 z-50 bg-white overflow-y-auto"
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors z-[60]"
            >
                <X className="w-6 h-6 text-neutral-900" />
            </button>

            {!isReady ? (
                <div className="flex h-screen w-full items-center justify-center gap-2 text-neutral-400">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-xs uppercase tracking-widest">Loading...</span>
                </div>
            ) : (
                <div className="min-h-screen container mx-auto px-6 py-24 flex flex-col md:flex-row gap-16 md:gap-24">

                    {/* Left Column: Context & Artist */}
                    <div className="flex-1 md:max-w-md space-y-12">
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="text-sm font-medium tracking-widest text-neutral-400 uppercase">
                                {today}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-oswald font-bold uppercase tracking-tight">
                                {activeTitle}
                            </h1>
                            {hasMultipleArtists && !selectedArtistId && (
                                <p className="text-neutral-500 font-medium">
                                    Featuring {artistsList.length} Artists
                                </p>
                            )}
                        </div>

                        {/* Multi-Artist Selector */}
                        {hasMultipleArtists && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Artists</h3>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => setSelectedArtistId(null)}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                                            selectedArtistId === null
                                                ? "bg-black text-white border-black"
                                                : "bg-white text-black border-neutral-200 hover:border-black"
                                        )}
                                    >
                                        All
                                    </button>
                                    {artistsList.map(artist => (
                                        <button
                                            key={artist.id}
                                            onClick={() => setSelectedArtistId(artist.id)}
                                            className={cn(
                                                "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                                                selectedArtistId === artist.id
                                                    ? "bg-black text-white border-black"
                                                    : "bg-white text-black border-neutral-200 hover:border-black"
                                            )}
                                        >
                                            {artist.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Active Artist Bio Section */}
                        {(activeBio || activePhoto) && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" key={selectedArtistId || 'default'}>
                                <div className="w-full aspect-square md:aspect-[4/3] bg-neutral-100 rounded-2xl overflow-hidden relative">
                                    {activePhoto ? (
                                        <img
                                            src={activePhoto}
                                            alt="Artist"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                            No Photo
                                        </div>
                                    )}
                                </div>

                                {activeBio && (
                                    <div className="prose prose-neutral prose-lg">
                                        <h3 className="text-lg font-bold font-oswald uppercase">{activeSubtitle} Bio</h3>
                                        <p className="text-neutral-600 leading-relaxed font-sans text-base">
                                            {activeBio}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Collection Grid */}
                    <div className="flex-1">
                        <div className="sticky top-8 space-y-8">
                            <div className="text-sm font-medium tracking-widest text-neutral-400 uppercase border-b border-neutral-200 pb-4 flex justify-between items-end">
                                <span>Collection Index</span>
                                <span className="text-black">{displayedArtworks.length} Works</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {displayedArtworks.map((artwork) => {
                                    // Find global index for navigation to work correctly across full list
                                    // Navigation MUST jump to the real index in the slider
                                    const globalIndex = artworks.findIndex(a => a.id === artwork.id);

                                    return (
                                        <button
                                            key={artwork.id}
                                            onClick={() => onNavigate(globalIndex)}
                                            className="group relative aspect-square bg-neutral-100 rounded-lg overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg text-left"
                                        >
                                            <img
                                                src={artwork.imageUrl}
                                                alt={artwork.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white">
                                                <div className="text-xs font-medium truncate">{artwork.title}</div>
                                                {/* Show artist name in grid only if viewing All */}
                                                {!selectedArtistId && (
                                                    <div className="text-[10px] text-neutral-500 truncate">{artwork.artist}</div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {displayedArtworks.length === 0 && (
                                <div className="py-20 text-center text-neutral-400">
                                    No artworks found for this selection.
                                </div>
                            )}

                            <div className="pt-12 text-center md:text-right">
                                <p className="text-[10px] text-neutral-300 font-sans tracking-widest uppercase">made by BLOBLOLACHOSE</p>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </motion.div>
    );
}
