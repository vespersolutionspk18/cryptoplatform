"use client";

import { useEffect, useRef, useState } from 'react';

// Fetch 24h ticker stats
async function fetch24hStats(symbol: string): Promise<{price: number, priceChangePercent: number}> {
  try {
    const response = await fetch(`/api/crypto-price?symbol=${symbol}`);
    if (!response.ok) {
      console.error(`API returned ${response.status} for ${symbol}`);
      const errorData = await response.text();
      console.error('Error response:', errorData);
      return { price: 0, priceChangePercent: 0 };
    }
    const data = await response.json();
    return {
      price: data.price || 0,
      priceChangePercent: data.priceChange24h || 0
    };
  } catch (error) {
    console.error(`24h stats fetch error for ${symbol}:`, error);
    return { price: 0, priceChangePercent: 0 };
  }
}

export function usePriceUpdates(symbol: string) {
  const [price, setPrice] = useState<number>(0);
  const [priceChange24h, setPriceChange24h] = useState<number>(0);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;

    // Start with HTTP polling immediately
    const startPolling = () => {
      console.log(`Starting price updates for symbol: ${symbol}`);
      // Initial fetch
      fetch24hStats(symbol).then(stats => {
        if (mounted && stats.price > 0) {
          setPrice(stats.price);
          setPriceChange24h(stats.priceChangePercent);
          setLastUpdate(Date.now());
        }
      });

      // Poll every 5 seconds if WebSocket is not connected
      intervalRef.current = setInterval(() => {
        if (!isWebSocketConnected) {
          fetch24hStats(symbol).then(stats => {
            if (mounted && stats.price > 0) {
              setPrice(stats.price);
              setPriceChange24h(stats.priceChangePercent);
              setLastUpdate(Date.now());
            }
          });
        }
      }, 5000);
    };

    // Try WebSocket connection
    const connectWebSocket = () => {
      try {
        const wsSymbol = `${symbol.toLowerCase()}usdc`;
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@ticker`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log(`WebSocket connected for ${wsSymbol}`);
          setIsWebSocketConnected(true);
          // Stop HTTP polling when WebSocket connects
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const newPrice = parseFloat(data.c);
            const priceChangePercent = parseFloat(data.P);
            
            if (!isNaN(newPrice) && newPrice > 0) {
              if (mounted) {
                setPrice(newPrice);
                setPriceChange24h(priceChangePercent);
                setLastUpdate(Date.now());
              }
            }
          } catch (error) {
            console.error('WebSocket message error:', error);
          }
        };

        ws.onerror = () => {
          setIsWebSocketConnected(false);
          // Resume HTTP polling on error
          if (!intervalRef.current && mounted) {
            startPolling();
          }
        };

        ws.onclose = () => {
          setIsWebSocketConnected(false);
          // Resume HTTP polling on close
          if (!intervalRef.current && mounted) {
            startPolling();
          }
        };
      } catch (error) {
        console.error('WebSocket creation failed:', error);
        // Fall back to HTTP polling
        startPolling();
      }
    };

    // Start with polling, then try WebSocket
    startPolling();
    connectWebSocket();

    return () => {
      mounted = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [symbol]);

  return { price, priceChange24h, isWebSocketConnected, lastUpdate };
}