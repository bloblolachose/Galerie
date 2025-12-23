import { useState } from "react";
import { Artist } from "@/types";
import { Plus, Trash2, X, Upload } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

interface ArtistManagerProps {
    artists: Artist[];
    onUpdate: (artists: Artist[]) => void;
    onUploadImage: (file: File) => Promise<string>;
}

export function ArtistManager({ artists, onUpdate, onUploadImage }: ArtistManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Temporary state for the artist being added/edited
    const [tempArtist, setTempArtist] = useState<Artist>({
        id: "",
        name: "",
        bio: "",
        photoUrl: ""
    });

    const handleSave = () => {
        if (!tempArtist.name) return;

        let newArtists = [...artists];

        if (editingId) {
            // Update existing
            newArtists = newArtists.map(a => a.id === editingId ? tempArtist : a);
        } else {
            // Add new
            newArtists.push({ ...tempArtist, id: uuidv4() });
        }

        onUpdate(newArtists);
        resetForm();
    };

    const handleEdit = (artist: Artist) => {
        setTempArtist(artist);
        setEditingId(artist.id);
        setIsAdding(true);
    };

    const handleRemove = (id: string) => {
        if (confirm("Remove this artist?")) {
            onUpdate(artists.filter(a => a.id !== id));
        }
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingId(null);
        setTempArtist({ id: "", name: "", bio: "", photoUrl: "" });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Artists</h3>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-neutral-200"
                    >
                        <Plus className="w-4 h-4" />
                        Add Artist
                    </button>
                )}
            </div>

            {/* List of Artists */}
            {!isAdding && (
                <div className="grid gap-3">
                    {artists.map(artist => (
                        <div key={artist.id} className="flex items-center gap-4 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
                            <div className="w-12 h-12 bg-neutral-700 rounded-full overflow-hidden shrink-0">
                                {artist.photoUrl ? (
                                    <img src={artist.photoUrl} alt={artist.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-500">
                                        <Upload className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white truncate">{artist.name}</h4>
                                <p className="text-xs text-neutral-400 truncate">{artist.bio || "No bio"}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleEdit(artist)}
                                    className="p-2 text-neutral-400 hover:text-white transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleRemove(artist.id)}
                                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {artists.length === 0 && (
                        <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
                            No artists added yet.
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Form */}
            {isAdding && (
                <div className="p-4 bg-neutral-800 rounded-xl border border-neutral-700 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{editingId ? "Edit Artist" : "New Artist"}</h4>
                        <button onClick={resetForm}><X className="w-5 h-5 text-neutral-400" /></button>
                    </div>

                    <div className="flex gap-4">
                        {/* Photo Input */}
                        <div className="shrink-0">
                            <div
                                className="w-24 h-24 bg-neutral-700 rounded-lg overflow-hidden relative group cursor-pointer border border-neutral-600"
                                onClick={() => document.getElementById('artist-form-photo')?.click()}
                            >
                                {tempArtist.photoUrl ? (
                                    <img src={tempArtist.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-xs text-neutral-400 gap-1">
                                        <Upload className="w-5 h-5" />
                                        <span>Photo</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                                    <span className="text-xs text-white">Change</span>
                                </div>
                            </div>
                            <input
                                id="artist-form-photo"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        try {
                                            const url = await onUploadImage(file);
                                            setTempArtist(prev => ({ ...prev, photoUrl: url }));
                                        } catch (err) {
                                            alert("Upload failed");
                                        }
                                    }
                                }}
                            />
                        </div>

                        {/* Text Fields */}
                        <div className="flex-1 space-y-3">
                            <input
                                type="text"
                                placeholder="Artist Name"
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                                value={tempArtist.name}
                                onChange={e => setTempArtist(prev => ({ ...prev, name: e.target.value }))}
                            />
                            <textarea
                                placeholder="Biography"
                                className="w-full h-24 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 resize-none focus:outline-none focus:border-neutral-500 text-sm"
                                value={tempArtist.bio}
                                onChange={e => setTempArtist(prev => ({ ...prev, bio: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={resetForm}
                            className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!tempArtist.name}
                            className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {editingId ? "Save Changes" : "Add Artist"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
