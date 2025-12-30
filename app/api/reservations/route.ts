import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { artworkId, visitorName, visitorEmail, visitorPhone } = await req.json();

        if (!artworkId || !visitorName || !visitorEmail) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Create Reservation
        const { error: reservationError } = await supabase
            .from('reservations')
            .insert({
                artwork_id: artworkId,
                visitor_name: visitorName,
                visitor_email: visitorEmail,
                visitor_phone: visitorPhone,
                status: 'pending',
                created_at: new Date().toISOString()
            });

        if (reservationError) throw reservationError;

        // 2. Update Artwork Status to 'reserved' (Auto-lock)
        const { error: artworkError } = await supabase
            .from('artworks')
            .update({ status: 'reserved' })
            .eq('id', artworkId);

        if (artworkError) throw artworkError;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Reservation Error:", error);
        return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
    }
}
