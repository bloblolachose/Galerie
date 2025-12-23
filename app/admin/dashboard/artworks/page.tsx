"use client";

import { useState, useCallback, useMemo } from "react";
import { useAllArtworks, useAllExhibitions } from "@/hooks/useGalleryData";
import { useAdminActions } from "@/hooks/useAdminActions";
import { Plus, Trash2, Search, Upload, X, Loader2, RefreshCw } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ArtworksPage() {
    const artworks = useAllArtworks();
    const { exhibitions } = useAllExhibitions(); // Get exhibitions to extract artists
    const { createArtwork, deleteArtwork, uploadImage } = useAdminActions();
    const router = useRouter();

    const [isCreating, setIsCreating] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isManualArtist, setIsManualArtist] = useState(false); // Toggle for manual entry

    const [formData, setFormData] = useState({
        title: "",
        artist: "",
        year: "",
        medium: "",
        dimensions: "",
        imageUrl: "",
        description: "",
        price: ""
    });

    const [searchTerm, setSearchTerm] = useState("");

    // Extract unique artists from exhibitions
    const availableArtists = useMemo(() => {
        const artists = new Set<string>();
        exhibitions.forEach(exh => {
            // Check both legacy artist name and new artists array
            if (exh.artistBio) {
                // It's hard to extract name from bio if not structured, 
                // but we can check the new 'artists' array
            }
            if (exh.artists && exh.artists.length > 0) {
                exh.artists.forEach(a => artists.add(a.name));
            }
        });
        // Also add artists from existing artworks to the list? 
        // useful if they are not yet in an exhibition.
        artworks.forEach(a => {
            if (a.artist) artists.add(a.artist);
        });

        return Array.from(artists).sort();
    }, [exhibitions, artworks]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsProcessing(true);
        try {
            const publicUrl = await uploadImage(file);
            setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
            toast.success("Image uploaded to cloud");
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        } finally {
            setIsProcessing(false);
        }
    }, [uploadImage]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 1
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.imageUrl) {
            alert("Please upload an image");
            return;
        }

        await createArtwork(formData);
        toast.success("Artwork created");

        setIsCreating(false);
        setFormData({
            title: "",
            artist: "",
            year: "",
            medium: "",
            dimensions: "",
            imageUrl: "",
            description: "",
            price: ""
        });

        // Force router refresh strictly
        router.refresh();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await deleteArtwork(id);
        toast.success("Artwork deleted");
    };

    const filteredArtworks = artworks.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Artwork Inventory</h1>
                    <p className="text-neutral-400 mt-1">Global list of all works available</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Artwork
                </button>
            </div>

            {isCreating && (
                <div className="mb-8 bg-neutral-900 border border-neutral-800 rounded-xl p-6 animate-in slide-in-from-top-4">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Image Upload Zone */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-neutral-400">Artwork Image</label>
                            {formData.imageUrl ? (
                                <div className="relative aspect-video w-full max-w-md mx-auto bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 group">
                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: "" }))}
                                            className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    {...getRootProps()}
                                    className={`
                                        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
                                        ${isDragActive ? 'border-white bg-neutral-900' : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'}
                                    `}
                                >
                                    <input {...getInputProps()} />
                                    {isProcessing ? (
                                        <div className="flex flex-col items-center gap-2 text-neutral-400">
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                            <p>Uploading...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-neutral-400">
                                            <Upload className="w-8 h-8" />
                                            <p>Drag & drop an image here, or click to select</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-400">Title</label>
                                <input
                                    required
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 focus:outline-none focus:border-neutral-600 transition-colors"
                                    placeholder="Artwork Title"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-neutral-400">Artist</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsManualArtist(!isManualArtist)}
                                        className="text-xs text-blue-400 hover:text-blue-300"
                                    >
                                        {isManualArtist ? "Select from list" : "Enter manually"}
                                    </button>
                                </div>

                                {isManualArtist ? (
                                    <input
                                        required
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 focus:outline-none focus:border-neutral-600 transition-colors"
                                        placeholder="Artist Name"
                                        value={formData.artist}
                                        onChange={e => setFormData({ ...formData, artist: e.target.value })}
                                    />
                                ) : (
                                    <select
                                        required
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 focus:outline-none focus:border-neutral-600 transition-colors appearance-none"
                                        value={formData.artist}
                                        onChange={e => setFormData({ ...formData, artist: e.target.value })}
                                    >
                                        <option value="">Select Artist...</option>
                                        {availableArtists.map(artist => (
                                            <option key={artist} value={artist}>{artist}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-400">Year</label>
                                <input
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 focus:outline-none focus:border-neutral-600 transition-colors"
                                    placeholder="2024"
                                    value={formData.year}
                                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-400">Medium</label>
                                <input
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 focus:outline-none focus:border-neutral-600 transition-colors"
                                    placeholder="Oil on Canvas"
                                    value={formData.medium}
                                    onChange={e => setFormData({ ...formData, medium: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-400">Dimensions</label>
                                <input
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 focus:outline-none focus:border-neutral-600 transition-colors"
                                    placeholder="100x100 cm"
                                    value={formData.dimensions}
                                    onChange={e => setFormData({ ...formData, dimensions: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-400">Description</label>
                            <textarea
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 focus:outline-none focus:border-neutral-600 transition-colors min-h-[100px]"
                                placeholder="Artwork description..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-neutral-800">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-6 py-2 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                            >
                                {isProcessing ? "Creating..." : "Create Artwork"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                    placeholder="Search artworks..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-neutral-600 transition-colors"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredArtworks.map(artwork => (
                    <div key={artwork.id} className="group relative bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                        <div className="aspect-square bg-neutral-950 relative">
                            <img
                                src={artwork.imageUrl}
                                alt={artwork.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button
                                    onClick={() => handleDelete(artwork.id)}
                                    className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-medium truncate">{artwork.title}</h3>
                            <p className="text-sm text-neutral-400 truncate">{artwork.artist}</p>
                        </div>
                    </div>
                ))}

                {filteredArtworks.length === 0 && (
                    <div className="col-span-full py-12 text-center text-neutral-500">
                        No artworks found
                    </div>
                )}
            </div>
        </div>
    );
}
