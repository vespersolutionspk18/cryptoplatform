import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol') || 'SOLUSDT';
  const interval = searchParams.get('interval') || '1m';
  const limit = searchParams.get('limit') || '60';

  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Binance data to our chart format
    const candles = data.map((candle: any[]) => ({
      date: new Date(candle[0]).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      openClose: [parseFloat(candle[1]), parseFloat(candle[4])],
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3])
    }));

    return NextResponse.json(candles);
  } catch (error) {
    console.error('Error fetching klines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch klines' },
      { status: 500 }
    );
  }
}