import { NextResponse } from 'next/server';

const getRandomGlobalCapital = () => {
    const caps = [
        { lat: 50.45, lng: 30.52 }, // Kyiv
        { lat: 55.75, lng: 37.61 }, // Moscow
        { lat: 38.89, lng: -77.03 }, // DC
        { lat: 31.76, lng: 35.21 }, // Jerusalem
        { lat: 35.68, lng: 51.38 }, // Tehran
        { lat: 39.90, lng: 116.40 }, // Beijing
        { lat: 25.03, lng: 121.56 }, // Taipei
    ];
    return caps[Math.floor(Math.random() * caps.length)];
};

const getGeoForHeadlines = async (headlines: string[], apiKey: string) => {
    try {
        const prompt = `Given these ${headlines.length} news headlines about global conflict, military movements, and politics, return a JSON array of ${headlines.length} objects representing the event. Each object must have a 'lat' (latitude) and 'lng' (longitude) float for the location. Also give each a 'theme' string which must be exactly one of: "KINETIC", "CYBER", "POLITICS", or "OTHER". If the event is global or uncertain, use coordinates of a major relevant capital (like Washington DC, Moscow, UN). Return ONLY valid JSON array with NO markdown wrapping or \`\`\`json blocks.
Headlines:
` + headlines.map((h, i) => `${i + 1}. ${h}`).join('\n');

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            const cleanSource = text.replace(/```json/gi, '').replace(/```/g, '').trim();
            const resultsArray = JSON.parse(cleanSource);
            if (Array.isArray(resultsArray) && resultsArray.length === headlines.length) {
                return resultsArray;
            }
        }
    } catch (e) {
        console.error('Gemini geo extraction failed', e);
    }

    return headlines.map(() => ({ ...getRandomGlobalCapital(), theme: 'POLITICS' }));
}

// In-memory cache to prevent spamming Gemini/NewsAPI on every component remount in dev
let cacheTime = 0;
let cachedThreats: any = null;

export async function GET() {
    const newsApiKey = process.env.NEWS_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!newsApiKey || !geminiApiKey) {
        const mockThreats = [
            {
                id: Math.random().toString(36).substr(2, 9),
                headline: 'Cyber attack localized in Eastern Europe grid sector',
                intensity: 8,
                url: 'https://news.google.com',
                timestamp: new Date().toISOString(),
                theme: 'CYBER',
                ...getRandomGlobalCapital(),
            }
        ];
        return NextResponse.json(mockThreats);
    }

    // Return cached data if less than 5 minutes old
    const now = Date.now();
    if (cachedThreats && now - cacheTime < 5 * 60 * 1000) {
        return NextResponse.json(cachedThreats);
    }

    try {
        const query = encodeURIComponent('war OR conflict OR Ukraine OR Israel OR Putin OR military OR geopolitical');

        // Fetch last 30 days
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 28);
        const fromStr = fromDate.toISOString().split('T')[0];

        const res = await fetch(`https://newsapi.org/v2/everything?q=${query}&language=en&from=${fromStr}&sortBy=publishedAt&pageSize=40&apiKey=${newsApiKey}`);
        const data = await res.json();

        if (data.status !== 'ok') {
            throw new Error(data.message || 'News API failed');
        }

        const topArticles = data.articles.filter((a: any) => a.title).slice(0, 40);
        const headlines = topArticles.map((a: any) => a.title);

        // Extract real world coordinates with Gemini based on Headline NLP
        const extractedDataList = await getGeoForHeadlines(headlines, geminiApiKey);

        const threats = topArticles.map((article: any, index: number) => ({
            id: Math.random().toString(36).substr(2, 9),
            headline: article.title,
            url: article.url,
            intensity: Math.floor(Math.random() * 5) + 3,
            timestamp: article.publishedAt || new Date().toISOString(),
            theme: extractedDataList[index]?.theme?.toUpperCase() || 'OTHER',
            lat: extractedDataList[index]?.lat || getRandomGlobalCapital().lat,
            lng: extractedDataList[index]?.lng || getRandomGlobalCapital().lng,
        }));

        cachedThreats = threats;
        cacheTime = now;

        return NextResponse.json(threats);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
