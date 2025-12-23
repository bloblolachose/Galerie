"use client";

import { useState } from "react";
import { useAllExhibitions } from "@/hooks/useGalleryData";
import { useAdminActions } from "@/hooks/useAdminActions";
import { Plus, Power, Trash2, Calendar, Edit, Download, Upload, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ExhibitionsPage() {
    const { exhibitions } = useAllExhibitions();
    const { createExhibition, setExhibitionActive, deleteExhibition, exportDatabase, importDatabase } = useAdminActions();
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dates, setDates] = useState({ start: "", end: "" });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await createExhibition({
            title,
            description,
            startDate: dates.start,
            endDate: dates.end,
            artworkIds: []
        });
        setIsCreating(false);
        setTitle("");
        setDescription("");
        setDates({ start: "", end: "" });
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 items-start">
                <div>
                    <h1 className="text-3xl font-bold">Exhibitions</h1>
                    <p className="text-neutral-400 mt-1 text-sm md:text-base">Manage gallery exhibitions and active status</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors shrink-0 w-full md:w-auto justify-center"
                >
                    <Plus className="w-4 h-4" />
                    New Exhibition
                </button>
            </div>

            {isCreating && (
                <div className="mb-8 bg-neutral-900 border border-neutral-800 rounded-xl p-6 animate-in slide-in-from-top-4">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <input
                                className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-white outline-none text-white placeholder-neutral-500"
                                placeholder="Exhibition Title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                            <div className="flex gap-2">
                                <input
                                    className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-white outline-none w-full text-white placeholder-neutral-500"
                                    placeholder="Start Date"
                                    type="text"
                                    value={dates.start}
                                    onChange={e => setDates(prev => ({ ...prev, start: e.target.value }))}
                                />
                                <input
                                    className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-white outline-none w-full text-white placeholder-neutral-500"
                                    placeholder="End Date"
                                    type="text"
                                    value={dates.end}
                                    onChange={e => setDates(prev => ({ ...prev, end: e.target.value }))}
                                />
                            </div>
                        </div>
                        <textarea
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-sm focus:border-white outline-none h-24 text-white placeholder-neutral-500"
                            placeholder="Description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-sm text-neutral-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                Create Exhibition
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {exhibitions?.length === 0 && (
                    <div className="text-center py-20 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                        No exhibitions found. Create one to get started.
                    </div>
                )}

                {exhibitions?.map(ex => (
                    <div
                        key={ex.id}
                        className={cn(
                            "flex items-center justify-between p-6 rounded-xl border transition-all",
                            ex.isActive ? "bg-white/5 border-white/20" : "bg-neutral-900/50 border-neutral-900"
                        )}
                    >
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-semibold">{ex.title}</h3>
                                {ex.isActive && (
                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs font-medium rounded-full border border-green-500/20">
                                        Active on iPad
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-neutral-400 max-w-xl line-clamp-1">{ex.description}</p>
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-2">
                                <Calendar className="w-3 h-3" />
                                <span>{ex.startDate} • {ex.endDate}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {!ex.isActive && (
                                <button
                                    onClick={() => setExhibitionActive(ex.id)}
                                    className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg"
                                    title="Set Active"
                                >
                                    <Power className="w-5 h-5" />
                                </button>
                            )}
                            {/* Link to detail page for managing artworks */}
                            <Link href={`/admin/dashboard/exhibition/${ex.id}`}>
                                <button className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg">
                                    <Edit className="w-5 h-5" />
                                </button>
                            </Link>

                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this exhibition?')) deleteExhibition(ex.id);
                                }}
                                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* System & Data Section */}
            <div className="mt-12 border-t border-neutral-800 pt-8">
                <h2 className="text-xl font-bold mb-4">System & Data</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Backup Gallery
                        </h3>
                        <p className="text-sm text-neutral-400 mb-4">
                            Download a backup of all artworks and exhibitions.
                        </p>
                        <button
                            onClick={async () => {
                                const json = await exportDatabase();
                                const blob = new Blob([json], { type: "application/json" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `gallery_backup_${new Date().toISOString().split('T')[0]}.json`;
                                a.click();
                            }}
                            className="text-sm bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 w-full"
                        >
                            Download Backup
                        </button>
                    </div>

                    <div className="p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Restore Gallery
                        </h3>
                        <p className="text-sm text-neutral-400 mb-4">
                            Import data from another device. Existing IDs will be updated.
                        </p>
                        <label className="block w-full">
                            <span className="sr-only">Choose backup file</span>
                            <div className="text-sm bg-neutral-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-neutral-700 w-full text-center cursor-pointer transition-colors relative">
                                Select Backup File
                                <input
                                    type="file"
                                    accept=".json"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        if (confirm("This will merge/overwrite data from the backup. Continue?")) {
                                            const text = await file.text();
                                            try {
                                                await importDatabase(text);
                                                alert("Restore successful! The page will reload.");
                                                window.location.reload();
                                            } catch (err) {
                                                alert("Failed to restore backup. Invalid file.");
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
