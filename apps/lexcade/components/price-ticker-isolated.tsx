"use client";

import { memo, useEffect, useState } from "react";
import { usePriceUpdates } from "@/hooks/use-price-updates";

interface PriceTickerProps {
  binanceSymbol: string;
  symbol: string;
}

// This component is completely isolated and only updates itself
const PriceTickerComponent = ({ binanceSymbol, symbol }: PriceTickerProps) => {
  const { price, isWebSocketConnected } = usePriceUpdates(binanceSymbol);
  
  return (
    <div className="text-xs text-center uppercase mt-3 flex items-center justify-center gap-1">
      <span>1 <span className="text-muted-foreground">{symbol} =</span> ${price > 0 ? price.toFixed(2) : '...'}{" "}
      <span className="text-muted-foreground">USD</span></span>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${isWebSocketConnected ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
    </div>
  );
};

export const PriceTicker = memo(PriceTickerComponent);