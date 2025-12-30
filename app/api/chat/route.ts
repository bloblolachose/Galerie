import { mistral } from '@ai-sdk/mistral';
import { generateText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Allow responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // 1. Fetch context (Exhibitions & Artworks)
        if (!process.env.MISTRAL_API_KEY) {
            throw new Error("Missing MISTRAL_API_KEY in server environment");
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get active exhibition
        const { data: exhibitions, error: dbError } = await supabase
            .from('exhibitions')
            .select('*')
            .eq('is_active', true)
            .limit(1);

        if (dbError) throw dbError;

        const activeExhibition = exhibitions?.[0];
        let artworkDetails = [];

        // Manually fetch artworks if exhibition exists and has IDs
        if (activeExhibition && activeExhibition.artwork_ids && activeExhibition.artwork_ids.length > 0) {
            const { data: artworks, error: artError } = await supabase
                .from('artworks')
                .select('*')
                .in('id', activeExhibition.artwork_ids);

            if (!artError && artworks) {
                artworkDetails = artworks;
            }
        }

        let systemPrompt = "You are a knowledgeable and elegant art gallery assistant. Answer questions briefly and politely.";

        if (activeExhibition) {
            const artworkList = artworkDetails.map((a: any) =>
                `- "${a.title}" by ${a.artist} (${a.year}): ${a.description}`
            ).join('\n') || "No artworks details available.";

            systemPrompt += `
    
CURRENT EXHIBITION CONTEXT:
Title: ${activeExhibition.title}
Description: ${activeExhibition.description}
Dates: ${activeExhibition.start_date} to ${activeExhibition.end_date}

ARTWORKS ON DISPLAY:
${artworkList}

INSTRUCTIONS:
- You are representing the gallery. Be professional yet welcoming.
- You speak FRENCH by default unless addressed in English.
- Use the context above to answer user questions about the specific artworks or the exhibition.
- If the user asks about something not in the context, politely say you don't have that information but can talk about the current exhibition.
- Keep answers concise (max 2-3 sentences unless asked for detail).
`;
        }


        const lastMessage = messages[messages.length - 1];
        // Debug Ping
        if (lastMessage.content.trim().toLowerCase() === 'ping') {
            return NextResponse.json({ text: "pong" });
        }

        const { text } = await generateText({
            model: mistral('mistral-large-latest'),
            system: systemPrompt,
            messages,
        });

        // Return simple JSON
        return NextResponse.json({ text });

    } catch (error: any) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: error.message || "Unknown server error" }), { status: 500 });
    }
}
