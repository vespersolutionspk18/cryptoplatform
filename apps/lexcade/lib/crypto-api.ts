// Crypto API Service for fetching live SOL/USD data
// Using CoinGecko API (free tier)

export interface CandleData {
  date: string;
  openClose: [number, number];
  high: number;
  low: number;
}

export interface PriceData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// CoinGecko API endpoints
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

// Fetch OHLC data from CoinGecko
// Note: Free tier has rate limits (10-30 calls/minute)
export async function fetchOHLCData(days: number = 1): Promise<CandleData[]> {
  try {
    // CoinGecko OHLC endpoint returns data in [timestamp, open, high, low, close] format
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/solana/ohlc?vs_currency=usd&days=${days}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: number[][] = await response.json();
    
    // Transform CoinGecko data to our chart format
    return data.map(([timestamp, open, high, low, close]) => ({
      date: new Date(timestamp).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      openClose: [open, close],
      high,
      low
    }));
  } catch (error) {
    console.error('Error fetching OHLC data:', error);
    throw error;
  }
}

// Fetch current price for real-time updates
export async function fetchCurrentPrice(cryptoId: string = 'solana'): Promise<number> {
  try {
    // Try Binance first (more reliable)
    const response = await fetch(
      `/api/crypto/price-binance?id=${cryptoId}`
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      // Fallback to CoinGecko if Binance fails
      const fallbackResponse = await fetch(
        `/api/crypto/price?id=${cryptoId}`
      );
      const fallbackData = await fallbackResponse.json();
      
      if (!fallbackResponse.ok) {
        console.error('Both APIs failed:', data, fallbackData);
        throw new Error(fallbackData.error || data.error || 'Failed to fetch price');
      }
      
      return fallbackData.price;
    }
    
    return data.price;
  } catch (error) {
    console.error('Error fetching current price:', error);
    throw error;
  }
}

// Alternative: Using Binance public API (no key required, better for real-time)
const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

export async function fetchBinanceKlines(symbol: string = 'SOLUSDT', interval: string = '1m', limit: number = 60): Promise<CandleData[]> {
  try {
    const response = await fetch(
      `/api/crypto/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Binance klines:', error);
    throw error;
  }
}

// WebSocket for real-time price updates (Binance)
export function subscribeToBinanceWebSocket(
  symbol: string,
  onUpdate: (data: PriceData) => void,
  interval: string = '1s'
): () => void {
  const symbolLower = symbol.toLowerCase();
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbolLower}@kline_${interval}`);
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.k) {
      const kline = message.k;
      onUpdate({
        time: kline.t,
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
        volume: parseFloat(kline.v)
      });
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  // Return cleanup function
  return () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
}