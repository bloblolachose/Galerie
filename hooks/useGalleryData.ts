import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Artwork, Exhibition } from '@/types';

// Helper to convert snake_case DB object to CamelCase TS object
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
        createdAt: new Date(a.created_at).getTime()
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
        createdAt: e.created_at,
        artistBio: e.artist_bio,
        artistPhotoUrl: e.artist_photo_url,
        artists: e.artists || [] // Parse JSONB column
    };
}

export function useAllArtworks() {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtworks = async () => {
            const { data, error } = await supabase
                .from('artworks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching artworks:', error);
            } else {
                setArtworks(data.map(camelCaseArtwork));
            }
            setLoading(false);
        };

        fetchArtworks();

        // Subscribe to changes
        const channel = supabase
            .channel('artworks_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'artworks' }, () => {
                fetchArtworks();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    return artworks;
}

export function useExhibition(id: string) {
    const [exhibition, setExhibition] = useState<Exhibition | null>(null);

    useEffect(() => {
        const fetchExhibition = async () => {
            if (!id) return;
            const { data, error } = await supabase
                .from('exhibitions')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching exhibition:', error);
            } else {
                // Fetch the specific artworks for this exhibition to adhere to order?
                // Actually the exhibition object needs the FULL artwork objects usually?
                // For now, our Exhibition type only has IDs. 
                // But typically we want the full objects in the UI. 
                // Let's extend the Exhibition object or use a separate hook to get sorted artworks.
                // For simplicity here, we return the exhibition metadata.
                // We'll hydrate the artworks in the component if needed.
                const exh = camelCaseExhibition(data);

                // Hydrate artworks
                if (exh.artworkIds.length > 0) {
                    const { data: arts } = await supabase
                        .from('artworks')
                        .select('*')
                        .in('id', exh.artworkIds);

                    if (arts) {
                        const artMap = new Map(arts.map(a => [a.id, a]));
                        // Attach a temporary property or just rely on IDs? 
                        // To make it easy, we will accept that Exhibition interface 
                        // might be used with a separate "artworks" list in the component.
                        // BUT, let's extend the object being returned by this hook to include 'artworks'
                        // even if not strictly in the Type (or assume the caller handles it).
                        // Let's stick to the Type. The caller (Page) usually does the mapping.
                        // UPDATE: In previous steps we saw the Page component doing `useAllArtworks` and filtering.
                        // But for exact ordering, we should handle it. 
                        // Let's add an extended property to the state if we want, 
                        // but for now let's match the existing pattern: Return the object as is.
                        // The Page component `app/page.tsx` or Admin page does the joining.
                        (exh as any).artworks = exh.artworkIds
                            .map(id => artMap.get(id))
                            .filter(Boolean)
                            .map(camelCaseArtwork);
                    } else {
                        (exh as any).artworks = [];
                    }
                } else {
                    (exh as any).artworks = [];
                }

                setExhibition(exh);
            }
        };

        fetchExhibition();

        const channel = supabase
            .channel(`exhibition_${id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'exhibitions', filter: `id=eq.${id}` }, () => {
                fetchExhibition();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [id]);

    return exhibition as (Exhibition & { artworks: Artwork[] }) | null;
}

export function useActiveExhibition() {
    const [exhibition, setExhibition] = useState<Exhibition | null>(null);

    useEffect(() => {
        const fetchActive = async () => {
            const { data, error } = await supabase
                .from('exhibitions')
                .select('*')
                .eq('is_active', true)
                .single();

            if (data) {
                const exh = camelCaseExhibition(data);
                // Hydrate artworks... similar logic
                if (exh.artworkIds.length > 0) {
                    const { data: arts } = await supabase
                        .from('artworks')
                        .select('*')
                        .in('id', exh.artworkIds);
                    if (arts) {
                        const artMap = new Map(arts.map(a => [a.id, a]));
                        (exh as any).artworks = exh.artworkIds
                            .map(id => artMap.get(id))
                            .filter(Boolean)
                            .map(camelCaseArtwork);
                    }
                } else {
                    (exh as any).artworks = [];
                }
                setExhibition(exh);
            }
        };

        fetchActive();
        // Polling or Subscription? Subscription is better.
        const channel = supabase
            .channel('active_exhibition')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'exhibitions' }, () => {
                // Ideally filter for is_active=true, but hard to know if the ID changed. Just refetch.
                fetchActive();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    return exhibition as (Exhibition & { artworks: Artwork[] }) | null;
}
