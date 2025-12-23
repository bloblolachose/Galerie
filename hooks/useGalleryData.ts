import useSWR from 'swr';
import { supabase } from "@/lib/supabase";
import { Artwork, Exhibition } from "@/types";

// Fetcher function
const fetcher = async (query: string) => {
    // This is a simplified fetcher, in reality we handle specific endpoints
    return null;
};

export function useActiveExhibition() {
    const { data, error, mutate } = useSWR('active-exhibition', async () => {
        // 1. Get active exhibition
        const { data: exhibitions } = await supabase
            .from('exhibitions')
            .select('*')
            .eq('is_active', true)
            .limit(1);

        const active = exhibitions?.[0];
        if (!active) return null;

        // 2. Get artworks
        // Postgres array contains IDs, we need to fetch all artworks where ID is in the array
        if (!active.artwork_ids || active.artwork_ids.length === 0) {
            return { ...camelCaseExhibition(active), artworks: [] };
        }

        // Supabase "in" filter
        const { data: artworks } = await supabase
            .from('artworks')
            .select('*')
            .in('id', active.artwork_ids);

        // Sort them in the order of the array
        const sortedArtworks = active.artwork_ids.map((id: string) =>
            artworks?.find((a: any) => a.id === id)
        ).filter(Boolean);

        return {
            ...camelCaseExhibition(active),
            artworks: sortedArtworks.map(camelCaseArtwork)
        };
    }, { refreshInterval: 2000 }); // Poll every 2s for "magic sync" feel

    return data;
}

export function useAllArtworks() {
    const { data } = useSWR('all-artworks', async () => {
        const { data } = await supabase
            .from('artworks')
            .select('*')
            .order('created_at', { ascending: false });
        return data?.map(camelCaseArtwork) || [];
    }, { refreshInterval: 2000 });

    return data;
}

export function useExhibition(id: string) {
    const { data } = useSWR(['exhibition', id], async () => {
        const { data: exhibition } = await supabase
            .from('exhibitions')
            .select('*')
            .eq('id', id)
            .single();

        if (!exhibition) return null;

        let artworks: any[] = [];
        if (exhibition.artwork_ids && exhibition.artwork_ids.length > 0) {
            const { data: arts } = await supabase
                .from('artworks')
                .select('*')
                .in('id', exhibition.artwork_ids);

            artworks = exhibition.artwork_ids.map((aid: string) =>
                arts?.find((a: any) => a.id === aid)
            ).filter(Boolean);
        }

        return {
            ...camelCaseExhibition(exhibition),
            artworks: artworks.map(camelCaseArtwork)
        };
    }, { refreshInterval: 2000 });

    return data;
}

export function useAllExhibitions() {
    const { data } = useSWR('all-exhibitions', async () => {
        const { data } = await supabase
            .from('exhibitions')
            .select('*')
            .order('created_at', { ascending: false });
        return data?.map(camelCaseExhibition) || [];
    }, { refreshInterval: 2000 });

    return data;
}

// Helpers to convert Snake_Case (DB) to CamelCase (App)
function camelCaseArtwork(a: any): Artwork {
    return {
        id: a.id,
        title: a.title,
        artist: a.artist,
        year: a.year,
        medium: a.medium,
        dimensions: a.dimensions,
        imageUrl: a.image_url,
        description: a.description,
        createdAt: a.created_at
    };
}

function camelCaseExhibition(e: any): Exhibition {
    return {
        id: e.id,
        title: e.title,
        description: e.description,
        startDate: e.start_date,
        endDate: e.end_date,
        isActive: e.is_active,
        artworkIds: e.artwork_ids || [],
        createdAt: e.created_at
    };
}
