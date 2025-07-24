import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cryptoId = searchParams.get('id') || 'solana';

  console.log('Fetching price for:', cryptoId);

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        cache: 'no-store'
      }
    );

    const responseText = await response.text();
    console.log('API Response:', response.status, responseText);

    if (!response.ok) {
      throw new Error(`CoinGecko API error! status: ${response.status}, message: ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Failed to parse response: ${responseText}`);
    }

    if (!data[cryptoId] || !data[cryptoId].usd) {
      throw new Error(`No price data found for ${cryptoId}`);
    }

    return NextResponse.json({ price: data[cryptoId].usd });
  } catch (error: any) {
    console.error('Error fetching crypto price:', error.message || error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch price' },
      { status: 500 }
    );
  }
}