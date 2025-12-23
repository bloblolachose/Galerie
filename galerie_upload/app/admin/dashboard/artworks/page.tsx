"use client";

import { useState, useCallback } from "react";
import { useAllArtworks } from "@/hooks/useGalleryData";
import { useAdminActions } from "@/hooks/useAdminActions";
import { Plus, Trash2, Search, Upload, X, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export default function ArtworksPage() {
    const artworks = useAllArtworks();
    const { createArtwork, deleteArtwork } = useAdminActions();
    const [isCreating, setIsCreating] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

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

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsProcessing(true);
        const reader = new FileReader();

        reader.onabort = () => setIsProcessing(false);
        reader.onerror = () => setIsProcessing(false);
        reader.onload = () => {
            setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            setIsProcessing(false);
        };

        reader.readAsDataURL(file);
    }, []);

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
    };

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
                                            onClick={() => setFormData(p => ({ ...p, imageUrl: "" }))}
                                            className="p-2 bg-black text-white rounded-full hover:bg-red-500 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${isDragActive ? 'border-white bg-neutral-800' : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'}`}
                                >
                                    <input {...getInputProps()} />
                                    <div className="p-4 bg-neutral-800 rounded-full">
                                        {isProcessing ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Upload className="w-6 h-6 text-white" />}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-white">Click or drag image to upload</p>
                                        <p className="text-xs text-neutral-500 mt-1">Supports JPG, PNG, WEBP</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <input
                                className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-white outline-none text-white placeholder-neutral-500"
                                placeholder="Title"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                            <input
                                className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-white outline-none text-white placeholder-neutral-500"
                                placeholder="Artist"
                                value={formData.artist}
                                onChange={e => setFormData({ ...formData, artist: e.target.value })}
                                required
                            />
                            <input
                                className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-white outline-none text-white placeholder-neutral-500"
                                placeholder="Year"
                                value={formData.year}
                                onChange={e => setFormData({ ...formData, year: e.target.value })}
                            />
                            <input
                                className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-white outline-none text-white placeholder-neutral-500"
                                placeholder="Medium"
                                value={formData.medium}
                                onChange={e => setFormData({ ...formData, medium: e.target.value })}
                            />
                            <input
                                className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-white outline-none text-white placeholder-neutral-500"
                                placeholder="Dimensions"
                                value={formData.dimensions}
                                onChange={e => setFormData({ ...formData, dimensions: e.target.value })}
                            />
                            <textarea
                                className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-white outline-none text-white placeholder-neutral-500 md:col-span-2 h-24 resize-none"
                                placeholder="Description (optional)"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                            {/* Hidden price input if needed, keeping it for data structure but potentially unused visually */}
                            {/* <input value={formData.price} ... /> */}
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-neutral-800">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-sm text-neutral-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!formData.imageUrl}
                                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add to Inventory
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {artworks?.map(art => (
                    <div key={art.id} className="group relative aspect-[4/5] bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">
                        <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                            <p className="font-medium text-white line-clamp-1">{art.title}</p>
                            <p className="text-sm text-neutral-300">{art.artist}</p>
                            <button
                                onClick={() => {
                                    if (confirm('Delete artwork?')) deleteArtwork(art.id);
                                }}
                                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
