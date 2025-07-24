"use client";

import { memo } from "react";
import { useCrypto } from "@/contexts/crypto-context";
import { LiveCandlestickChart } from "@/components/live-candlestick-chart-isolated";

interface ChartContainerProps {
  selectedPeriod: string;
  limit: number;
}

// This component will handle its own updates without affecting the parent
const ChartContainer = memo(({ selectedPeriod, limit }: ChartContainerProps) => {
  const { cryptoConfig } = useCrypto();
  
  console.log("ChartContainer rendered - this should only log when period changes");
  
  return (
    <LiveCandlestickChart 
      key={`${cryptoConfig.symbol}-${selectedPeriod}`} 
      interval={selectedPeriod} 
      limit={limit} 
    />
  );
});

ChartContainer.displayName = 'ChartContainer';

export default ChartContainer;