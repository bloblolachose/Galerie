"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Exhibition, Artwork } from "@/types";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface HomeMenuProps {
    isOpen: boolean;
    onClose: () => void;
    exhibition: Exhibition;
    artworks: Artwork[];
    onNavigate: (index: number) => void;
}

export function HomeMenu({ isOpen, onClose, exhibition, artworks, onNavigate }: HomeMenuProps) {
    const artists = exhibition.artists || [];

    // Fallback for single artist migration: if no new artists array but legacy bio exists
    if (artists.length === 0 && (exhibition.artistBio || exhibition.artistPhotoUrl)) {
        artists.push({
            id: 'legacy',
            name: 'Artist',
            bio: exhibition.artistBio || '',
            photoUrl: exhibition.artistPhotoUrl || ''
        });
    }

    const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);

    // Filter artworks based on selection
    const filteredArtworks = selectedArtistId
        ? artworks.filter(a => {
            const artist = artists.find(art => art.id === selectedArtistId);
            // Loose matching: check if artwork.artist string contains the selected artist name
            return artist && a.artist.toLowerCase().includes(artist.name.toLowerCase());
        })
        : artworks;

    // Auto-select first artist if only one exists
    useEffect(() => {
        if (artists.length === 1 && !selectedArtistId) {
            setSelectedArtistId(artists[0].id);
        }
    }, [artists, selectedArtistId]);

    const activeArtist = selectedArtistId ? artists.find(a => a.id === selectedArtistId) : null;

    if (!isOpen) return null;

    const today = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl overflow-y-auto"
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors z-[60]"
            >
                <X className="w-6 h-6 text-neutral-900" />
            </button>

            <div className="min-h-screen container mx-auto px-6 py-24 flex flex-col md:flex-row gap-16 md:gap-24">

                {/* Left Column: Context & Artist List */}
                <div className="flex-1 md:max-w-md space-y-12">
                    {/* Header */}
                    <div className="space-y-2">
                        <div className="text-sm font-medium tracking-widest text-neutral-400 uppercase">
                            {today}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-oswald font-bold uppercase tracking-tight">
                            {exhibition.title}
                        </h1>
                    </div>

                    {/* Artist Selection */}
                    {artists.length > 0 && (
                        <div className="space-y-8">
                            {/* Artist List (Horizontal if multiple) */}
                            {artists.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                    {artists.map(artist => (
                                        <button
                                            key={artist.id}
                                            onClick={() => setSelectedArtistId(artist.id)}
                                            className={cn(
                                                "shrink-0 flex items-center gap-3 pr-4 p-1 rounded-full border transition-all",
                                                selectedArtistId === artist.id
                                                    ? "border-neutral-900 bg-neutral-900 text-white"
                                                    : "border-transparent bg-neutral-100 hover:bg-neutral-200 text-neutral-900"
                                            )}
                                        >
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-300">
                                                {artist.photoUrl && (
                                                    <img src={artist.photoUrl} alt="" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <span className="text-sm font-medium">{artist.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Active Artist Detail */}
                            {activeArtist && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={activeArtist.id}
                                    className="space-y-6"
                                >
                                    <div className="w-full aspect-square md:aspect-[4/3] bg-neutral-100 rounded-2xl overflow-hidden relative">
                                        {activeArtist.photoUrl ? (
                                            <img
                                                src={activeArtist.photoUrl}
                                                alt={activeArtist.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                No Photo
                                            </div>
                                        )}
                                    </div>

                                    <div className="prose prose-neutral prose-lg">
                                        <p className="text-neutral-600 leading-relaxed font-sans">
                                            {activeArtist.bio}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                            {/* Hint if no artist selected among many */}
                            {!activeArtist && artists.length > 1 && (
                                <div className="text-neutral-400 italic">
                                    Select an artist to view their biography and collection.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Collection Grid */}
                <div className="flex-1">
                    <div className="sticky top-8 space-y-8">
                        <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                            <div className="text-sm font-medium tracking-widest text-neutral-400 uppercase">
                                Collection Index ({filteredArtworks.length})
                            </div>
                            {selectedArtistId && artists.length > 1 && (
                                <button
                                    onClick={() => setSelectedArtistId(null)}
                                    className="text-xs text-neutral-500 hover:text-neutral-900"
                                >
                                    Show All
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredArtworks.map((artwork) => (
                                <button
                                    key={artwork.id}
                                    onClick={() => onNavigate(artworks.findIndex(a => a.id === artwork.id))} // Find original index
                                    className="group relative aspect-square bg-neutral-50 rounded-lg overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <img
                                        src={artwork.imageUrl}
                                        alt={artwork.title}
                                        className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                                        <p className="text-white text-xs font-medium md:text-sm line-clamp-2">
                                            {artwork.title}
                                        </p>
                                    </div>
                                </button>
                            ))}
                            {filteredArtworks.length === 0 && (
                                <div className="col-span-full text-center py-12 text-neutral-400">
                                    No artworks found for this selection.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
