import { mistral } from '@ai-sdk/mistral';
import { streamText } from 'ai';
import { createClient } from '@supabase/supabase-js';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    // 1. Fetch context (Exhibitions & Artworks)
    // Note: We use a service role logic or just anonymous public read if RLS allows
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get active exhibition
    const { data: exhibitions } = await supabase
        .from('exhibitions')
        .select('*, artworks(*)')
        .eq('is_active', true)
        .limit(1);

    const activeExhibition = exhibitions?.[0];

    let systemPrompt = "You are a knowledgeable and elegant art gallery assistant. Answer questions briefly and politely.";

    if (activeExhibition) {
        const artworkList = activeExhibition.artworks.map((a: any) =>
            `- "${a.title}" by ${a.artist} (${a.year}): ${a.description}`
        ).join('\n');

        systemPrompt += `
    
CURRENT EXHIBITION CONTEXT:
Title: ${activeExhibition.title}
Description: ${activeExhibition.description}
Dates: ${activeExhibition.start_date} to ${activeExhibition.end_date}

ARTWORKS ON DISPLAY:
${artworkList}

INSTRUCTIONS:
- You are representing the gallery. Be professional yet welcoming.
- Use the context above to answer user questions about the specific artworks or the exhibition.
- If the user asks about something not in the context, politely say you don't have that information but can talk about the current exhibition.
- Keep answers concise (max 2-3 sentences unless asked for detail).
`;
    }

    const result = streamText({
        model: mistral('mistral-large-latest'),
        system: systemPrompt,
        messages,
    });

    return result.toTextStreamResponse();
}
