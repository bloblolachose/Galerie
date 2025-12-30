import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { artworkId, visitorName, visitorEmail, visitorPhone } = await req.json();

        if (!artworkId || !visitorName || !visitorEmail) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 1. Create Reservation
        console.log("Creating reservation for artwork:", artworkId);
        const { error: reservationError } = await supabase
            .from('reservations')
            .insert({
                artwork_id: artworkId,
                visitor_name: visitorName,
                visitor_email: visitorEmail,
                visitor_phone: visitorPhone,
                status: 'pending'
            });

        if (reservationError) {
            console.error("Supabase Insert Error:", reservationError);
            throw reservationError;
        }

        // 2. Update Artwork Status to 'reserved' (Auto-lock)
        console.log("Updating artwork status to reserved:", artworkId);
        const { error: artworkError } = await supabase
            .from('artworks')
            .update({ status: 'reserved' })
            .eq('id', artworkId);

        if (artworkError) {
            console.error("Supabase Update Error:", artworkError);
            throw artworkError;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json({
            error: error.message || "Unknown error",
            details: error
        }, { status: 500 });
    }
}
