import { NextResponse } from 'next/server';

export async function GET() {
    const fmpApiKey = process.env.FMP_API_KEY;

    if (!fmpApiKey) {
        const mockData = [
            { symbol: 'LMT', price: 450.25, change: 2.5, trend: 'up' },
            { symbol: 'RTX', price: 92.10, change: 1.2, trend: 'up' },
            { symbol: 'GD', price: 235.60, change: 0.8, trend: 'up' },
            { symbol: 'NOC', price: 470.15, change: 3.1, trend: 'up' },
        ];
        return NextResponse.json(mockData);
    }

    try {
        const res = await fetch(`https://financialmodelingprep.com/api/v3/quote/LMT,RTX,GD,NOC?apikey=${fmpApiKey}`);
        const data = await res.json();

        if (data['Error Message']) {
            throw new Error(data['Error Message']);
        }

        const formattedData = data.map((stock: any) => ({
            symbol: stock.symbol,
            price: stock.price,
            change: stock.changesPercentage,
            trend: stock.changesPercentage >= 0 ? 'up' : 'down'
        }));

        return NextResponse.json(formattedData);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
