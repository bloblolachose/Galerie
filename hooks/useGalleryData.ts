import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Artwork, Exhibition } from '@/types';
import { useSyncStore } from '@/store/syncStore';

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
        price: a.price,
        status: a.status,
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
    const version = useSyncStore(s => s.version);

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
    }, [version]);

    return artworks;
}

export function useExhibition(id: string) {
    const [exhibition, setExhibition] = useState<Exhibition | null>(null);
    const version = useSyncStore(s => s.version);

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
                const exh = camelCaseExhibition(data);

                // Hydrate artworks
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
    }, [id, version]);

    return exhibition as (Exhibition & { artworks: Artwork[] }) | null;
}

export function useActiveExhibition() {
    const [exhibition, setExhibition] = useState<Exhibition | null | undefined>(undefined);
    const version = useSyncStore(s => s.version);

    useEffect(() => {
        const fetchActive = async () => {
            const { data, error } = await supabase
                .from('exhibitions')
                .select('*')
                .eq('is_active', true)
                .single();

            if (data) {
                const exh = camelCaseExhibition(data);
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
            } else {
                setExhibition(null);
            }
        };

        fetchActive();

        // Subscription
        const channel = supabase
            .channel('active_exhibition')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'exhibitions' }, () => {
                fetchActive();
            })
            .subscribe();

        // Polling fallback (every 10 seconds)
        const interval = setInterval(() => {
            fetchActive();
        }, 10000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, [version]);

    return exhibition as (Exhibition & { artworks: Artwork[] }) | null;
}

export function useAllExhibitions() {
    const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
    const [loading, setLoading] = useState(true);
    const version = useSyncStore(s => s.version);

    useEffect(() => {
        const fetchExhibitions = async () => {
            const { data, error } = await supabase
                .from('exhibitions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching exhibitions:', error);
            } else {
                setExhibitions(data.map(camelCaseExhibition));
            }
            setLoading(false);
        };

        fetchExhibitions();

        const channel = supabase
            .channel('all_exhibitions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'exhibitions' }, () => {
                fetchExhibitions();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [version]);

    return { exhibitions, loading };
}
