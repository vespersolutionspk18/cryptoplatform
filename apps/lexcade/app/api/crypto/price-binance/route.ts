import { NextRequest, NextResponse } from 'next/server';

const SYMBOL_MAP: Record<string, string> = {
  'solana': 'SOLUSDT',
  'bitcoin': 'BTCUSDT',
  'ethereum': 'ETHUSDT'
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cryptoId = searchParams.get('id') || 'solana';
  const symbol = SYMBOL_MAP[cryptoId] || 'SOLUSDT';

  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Binance API error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ price: parseFloat(data.price) });
  } catch (error: any) {
    console.error('Error fetching crypto price from Binance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch price' },
      { status: 500 }
    );
  }
}