import { db } from "@/lib/db";
import { Artwork, Exhibition } from "@/types";
import { v4 as uuidv4 } from 'uuid';

export function useAdminActions() {

    // Artwork Actions
    const createArtwork = async (data: Omit<Artwork, 'id' | 'createdAt'>) => {
        const id = uuidv4();
        await db.artworks.add({
            id,
            ...data,
            createdAt: Date.now()
        });
        return id;
    };

    const deleteArtwork = async (id: string) => {
        await db.artworks.delete(id);
        // Also remove from any exhibitions
        const exhibitions = await db.exhibitions.toArray();
        for (const ex of exhibitions) {
            if (ex.artworkIds.includes(id)) {
                await db.exhibitions.update(ex.id, {
                    artworkIds: ex.artworkIds.filter(aid => aid !== id)
                });
            }
        }
    };

    // Exhibition Actions
    const createExhibition = async (data: Omit<Exhibition, 'id' | 'createdAt' | 'isActive'>) => {
        const id = uuidv4();
        await db.exhibitions.add({
            id,
            ...data,
            isActive: false,
            createdAt: Date.now()
        });
        return id;
    };

    const setExhibitionActive = async (id: string) => {
        await db.transaction('rw', db.exhibitions, async () => {
            await db.exhibitions.toCollection().modify({ isActive: false });
            await db.exhibitions.update(id, { isActive: true });
        });
    };

    const updateExhibitionArtworks = async (id: string, artworkIds: string[]) => {
        await db.exhibitions.update(id, { artworkIds });
    };

    const deleteExhibition = async (id: string) => {
        await db.exhibitions.delete(id);
    };

    // System Actions
    const exportDatabase = async () => {
        const artworks = await db.artworks.toArray();
        const exhibitions = await db.exhibitions.toArray();
        return JSON.stringify({ artworks, exhibitions, exportedAt: Date.now() }, null, 2);
    };

    const importDatabase = async (jsonString: string) => {
        try {
            const data = JSON.parse(jsonString);

            await db.transaction('rw', db.artworks, db.exhibitions, async () => {
                if (data.artworks && Array.isArray(data.artworks)) {
                    await db.artworks.bulkPut(data.artworks);
                }
                if (data.exhibitions && Array.isArray(data.exhibitions)) {
                    await db.exhibitions.bulkPut(data.exhibitions);
                }
            });
            return true;
        } catch (e) {
            console.error("Import failed", e);
            throw new Error("Invalid backup file format");
        }
    };

    return {
        createArtwork,
        deleteArtwork,
        createExhibition,
        setExhibitionActive,
        updateExhibitionArtworks,
        deleteExhibition,
        exportDatabase,
        importDatabase
    };
}
