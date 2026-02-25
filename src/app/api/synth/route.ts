import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { text } = await req.json();
    const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;

    if (!elevenLabsApiKey) {
        return NextResponse.json({ error: 'ELEVEN_LABS_API_KEY not configured' }, { status: 500 });
    }

    // A voice ID that sounds robotic/authoritative
    const voiceId = 'MF3mGyEYCl7XYWbV9V6O';

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': elevenLabsApiKey,
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.1,
                    similarity_boost: 0.8,
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`ElevenLabs API responded with status ${response.status}`);
        }

        const audioBuffer = await response.arrayBuffer();

        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
            },
        });

    } catch (error: any) {
        console.error('ElevenLabs Error:', error);
        return NextResponse.json({ error: 'Voice synthesis failed' }, { status: 500 });
    }
}
