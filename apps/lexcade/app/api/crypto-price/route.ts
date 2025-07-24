import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }
    
    // Handle both "SOL" and "SOLUSDC" formats
    let binanceSymbol = symbol.toUpperCase();
    if (!binanceSymbol.endsWith('USDC') && !binanceSymbol.endsWith('USDT')) {
      binanceSymbol = `${binanceSymbol}USDC`;
    }
    // If symbol ends with USDT, convert to USDC
    if (binanceSymbol.endsWith('USDT')) {
      binanceSymbol = binanceSymbol.replace('USDT', 'USDC');
    }
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`);
    
    if (!response.ok) {
      console.error(`Binance API error for ${binanceSymbol}: ${response.status}`);
      return NextResponse.json({ 
        error: 'Failed to fetch price data',
        symbol: binanceSymbol,
        status: response.status 
      }, { status: response.status });
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      price: parseFloat(data.lastPrice),
      priceChange24h: parseFloat(data.priceChangePercent),
      volume24h: parseFloat(data.volume),
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice),
    });
  } catch (error) {
    console.error('Error fetching crypto price:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}