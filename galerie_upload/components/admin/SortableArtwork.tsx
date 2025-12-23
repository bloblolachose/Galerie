"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Artwork } from "@/types";
import { GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableArtworkProps {
    artwork: Artwork;
    onRemove: () => void;
}

export function SortableArtwork({ artwork, onRemove }: SortableArtworkProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: artwork.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-4 bg-neutral-900 border border-neutral-800 p-3 rounded-lg group select-none touch-none",
                isDragging && "opacity-50 ring-2 ring-white"
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-neutral-500 hover:text-white"
            >
                <GripVertical className="w-5 h-5" />
            </div>

            <div className="h-12 w-12 rounded overflow-hidden bg-neutral-800 shrink-0">
                <img src={artwork.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-white truncate">{artwork.title}</h4>
                <p className="text-xs text-neutral-400 truncate">{artwork.artist}</p>
            </div>

            <button
                onClick={onRemove}
                className="p-2 text-neutral-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
