"use client";

import { useState } from "react";

import { useExhibition, useAllArtworks } from "@/hooks/useGalleryData";
import { useAdminActions } from "@/hooks/useAdminActions";
import { Artwork } from "@/types";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { SortableArtwork } from "@/components/admin/SortableArtwork";
import { ArtistManager } from "@/components/admin/ArtistManager";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ExhibitionDetailsPage() {
    const { id } = useParams() as { id: string };
    const exhibition = useExhibition(id);
    const allArtworks = useAllArtworks();
    const { updateExhibitionArtworks, updateExhibitionDetails, uploadImage } = useAdminActions();

    // Sensors for DnD
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Filter artist state
    const [artistFilter, setArtistFilter] = useState<string>("");

    if (!exhibition) return <div className="p-8 text-neutral-500">Loading...</div>;

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            // Find indices
            const oldIndex = exhibition.artworkIds.indexOf(active.id as string);
            const newIndex = exhibition.artworkIds.indexOf(over?.id as string);

            const newOrder = arrayMove(exhibition.artworkIds, oldIndex, newIndex);
            updateExhibitionArtworks(id, newOrder);
        }
    };

    const handleRemoveArtwork = (artworkId: string) => {
        const newOrder = exhibition.artworkIds.filter(id => id !== artworkId);
        updateExhibitionArtworks(id, newOrder);
    };

    const handleAddArtwork = (artworkId: string) => {
        if (exhibition.artworkIds.includes(artworkId)) return;
        const newOrder = [...exhibition.artworkIds, artworkId];
        updateExhibitionArtworks(id, newOrder);
    };

    const availableArtworks = allArtworks?.filter(
        a => !exhibition.artworkIds.includes(a.id)
    ).filter(
        a => artistFilter ? a.artist === artistFilter : true
    );

    const uniqueArtists = Array.from(new Set(allArtworks?.map(a => a.artist).filter(Boolean))).sort();

    return (
        <div className="p-8 max-w-6xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex items-center gap-4 mb-8 shrink-0">
                <Link href="/admin/dashboard" className="p-2 -ml-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{exhibition.title}</h1>
                    <p className="text-neutral-400">Manage curated selection</p>
                </div>
            </div>

            {/* Artist Details Section */}
            <div className="mb-8 p-6 bg-neutral-900/50 rounded-xl border border-neutral-800">
                <ArtistManager
                    artists={exhibition.artists || []}
                    onUpdate={(newArtists) => updateExhibitionDetails(id, { artists: newArtists })}
                    onUploadImage={uploadImage}
                />
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
                {/* Active List (Sortable) */}
                <div className="flex flex-col bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden">
                    <div className="p-4 border-b border-neutral-800 bg-neutral-900">
                        <h2 className="font-semibold">In Exhibition ({exhibition.artworks.length})</h2>
                        <p className="text-xs text-neutral-500">Drag to reorder</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={exhibition.artworkIds}
                                strategy={verticalListSortingStrategy}
                            >
                                {exhibition.artworks.map(artwork => (
                                    <SortableArtwork
                                        key={artwork.id}
                                        artwork={artwork}
                                        onRemove={() => handleRemoveArtwork(artwork.id)}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>

                        {exhibition.artworks.length === 0 && (
                            <div className="text-center py-20 text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
                                Exhibition is empty. Add artworks from the right.
                            </div>
                        )}
                    </div>
                </div>

                {/* Available List */}
                <div className="flex flex-col bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden">
                    <div className="p-4 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between gap-4">
                        <div>
                            <h2 className="font-semibold">Available Inventory</h2>
                            <p className="text-xs text-neutral-500">Tap to add</p>
                        </div>
                        <select
                            value={artistFilter}
                            onChange={(e) => setArtistFilter(e.target.value)}
                            className="bg-neutral-800 border border-neutral-700 text-sm rounded-lg px-2 py-1 focus:outline-none focus:border-neutral-500 max-w-[150px]"
                        >
                            <option value="">All Artists</option>
                            {uniqueArtists.map(artist => (
                                <option key={artist} value={artist}>{artist}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 content-start grid gap-2">
                        {availableArtworks?.map(artwork => (
                            <div
                                key={artwork.id}
                                className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-neutral-700 hover:bg-neutral-800 transition-colors cursor-pointer"
                                onClick={() => handleAddArtwork(artwork.id)}
                            >
                                <div className="h-10 w-10 rounded overflow-hidden bg-neutral-800 shrink-0">
                                    <img src={artwork.imageUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm text-white truncate">{artwork.title}</h4>
                                    <p className="text-xs text-neutral-400 truncate">{artwork.artist}</p>
                                </div>
                                <Plus className="w-4 h-4 text-neutral-500" />
                            </div>
                        ))}
                        {availableArtworks?.length === 0 && (
                            <div className="text-center py-10 text-neutral-500">
                                No artwork found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
