"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
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
            transition={{ duration: 0.15, ease: "easeOut" }}
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

                {/* Left Column: Context & Artist */}
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

                    {/* Artist Bio Section */}
                    {(exhibition.artistBio || exhibition.artistPhotoUrl) && (
                        <div className="space-y-6">
                            <div className="w-full aspect-square md:aspect-[4/3] bg-neutral-100 rounded-2xl overflow-hidden relative">
                                {exhibition.artistPhotoUrl ? (
                                    <img
                                        src={exhibition.artistPhotoUrl}
                                        alt="Artist"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                        No Photo
                                    </div>
                                )}
                            </div>

                            {exhibition.artistBio && (
                                <div className="prose prose-neutral prose-lg">
                                    <p className="text-neutral-600 leading-relaxed font-sans">
                                        {exhibition.artistBio}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Collection Grid */}
                <div className="flex-1">
                    <div className="sticky top-8 space-y-8">
                        <div className="text-sm font-medium tracking-widest text-neutral-400 uppercase border-b border-neutral-200 pb-4">
                            Collection Index
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {artworks.map((artwork, idx) => (
                                <button
                                    key={artwork.id}
                                    onClick={() => onNavigate(idx)}
                                    className="group relative aspect-square bg-neutral-50 rounded-lg overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <img
                                        src={artwork.imageUrl}
                                        alt={artwork.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/90 backdrop-blur-sm">
                                        <div className="text-xs font-medium truncate">{artwork.title}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
