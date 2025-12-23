import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Artwork, Exhibition } from "@/types";

export function useActiveExhibition() {
    const exhibition = useLiveQuery(async () => {
        // Fetch all to avoid potential index/type issues with .filter() or .where()
        const all = await db.exhibitions.toArray();
        const active = all.find(ex => ex.isActive);

        if (!active) return null;

        // Fetch the artworks
        const artworks = await Promise.all(
            active.artworkIds.map(id => db.artworks.get(id))
        );

        // Filter out undefined
        const validArtworks = artworks.filter((a): a is Artwork => !!a);

        return {
            ...active,
            artworks: validArtworks
        };
    });

    return exhibition;
}

export function useAllArtworks() {
    return useLiveQuery(() => db.artworks.orderBy("createdAt").reverse().toArray());
}


export function useExhibition(id: string) {
    return useLiveQuery(async () => {
        const exhibition = await db.exhibitions.get(id);
        if (!exhibition) return null;

        // Populate artworks
        const artworks = await Promise.all(
            exhibition.artworkIds.map(aid => db.artworks.get(aid))
        );
        const validArtworks = artworks.filter((a): a is Artwork => !!a);

        return {
            ...exhibition,
            artworks: validArtworks
        };
    }, [id]);
}

export function useAllExhibitions() {
    return useLiveQuery(() => db.exhibitions.orderBy("createdAt").reverse().toArray());
}
