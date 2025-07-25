"use client";

import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import { useCrypto } from "@/contexts/crypto-context";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  CartesianGrid,
  ReferenceLine,
  TooltipProps,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { fetchBinanceKlines, subscribeToBinanceWebSocket, CandleData, PriceData } from "@/lib/crypto-api";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

// Prevent re-renders by using refs for all mutable data
interface CandlestickProps {
  x: number;
  y: number;
  width: number;
  height: number;
  low: number;
  high: number;
  openClose: [number, number];
}

const chartConfig = {
  openClose: {
    label: "Price",
    color: "var(--chart-1)",
  },
  high: {
    label: "High",
    color: "var(--chart-2)",
  },
  low: {
    label: "Low",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const Candlestick = memo((props: CandlestickProps) => {
  const {
    x,
    y,
    width,
    height,
    low,
    high,
    openClose: [open, close],
  } = props;
  const isGrowing = open < close;
  const ratio = Math.abs(height / (open - close));

  return (
    <g>
      <path
        className={`${isGrowing ? "fill-emerald-500" : "fill-rose-500"}`}
        d={`
            M ${x},${y}
            L ${x},${y + height}
            L ${x + width},${y + height}
            L ${x + width},${y}
            L ${x},${y}
          `}
      />
      <g
        className={`${isGrowing ? "stroke-emerald-500" : "stroke-rose-500"}`}
        strokeWidth="1"
      >
        {/* bottom line */}
        {isGrowing ? (
          <path
            d={`
                M ${x + width / 2}, ${y + height}
                v ${(open - low) * ratio}
              `}
          />
        ) : (
          <path
            d={`
                M ${x + width / 2}, ${y}
                v ${(close - low) * ratio}
              `}
          />
        )}
        {/* top line */}
        {isGrowing ? (
          <path
            d={`
                M ${x + width / 2}, ${y}
                v ${(close - high) * ratio}
              `}
          />
        ) : (
          <path
            d={`
                M ${x + width / 2}, ${y + height}
                v ${(open - high) * ratio}
              `}
          />
        )}
      </g>
    </g>
  );
});

Candlestick.displayName = 'Candlestick';

const renderCandlestick = (props: any) => {
  const { x, y, width, height, payload } = props;

  if (
    payload &&
    payload.low !== undefined &&
    payload.high !== undefined &&
    payload.openClose
  ) {
    return (
      <Candlestick
        x={x}
        y={y}
        width={width}
        height={height}
        low={payload.low}
        high={payload.high}
        openClose={payload.openClose}
      />
    );
  }

  return <g />;
};

const CustomTooltip = memo(({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload as CandleData | undefined;
    if (!data) return null;

    return (
      <div className="bg-popover text-popover-foreground grid min-w-32 items-start gap-1.5 rounded-lg border px-3 py-1.5 text-xs">
        <p className="font-medium">{data.date}</p>
        <p className="text-muted-foreground">
          Open:{" "}
          <span className="text-foreground font-medium">
            ${data.openClose[0].toFixed(2)}
          </span>
        </p>
        <p className="text-muted-foreground">
          High: <span className="text-foreground font-medium">${data.high.toFixed(2)}</span>
        </p>
        <p className="text-muted-foreground">
          Low: <span className="text-foreground font-medium">${data.low.toFixed(2)}</span>
        </p>
        <p className="text-muted-foreground">
          Close:{" "}
          <span className="text-foreground font-medium">
            ${data.openClose[1].toFixed(2)}
          </span>
        </p>
      </div>
    );
  }

  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

interface LiveCandlestickChartProps {
  interval?: string;
  limit?: number;
}

// This is the key - the chart updates internally but doesn't trigger parent re-renders
const LiveCandlestickChartComponent = ({ interval = '1m', limit = 60 }: LiveCandlestickChartProps) => {
  const { cryptoConfig } = useCrypto();
  const [data, setData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to prevent re-renders
  const dataRef = useRef<CandleData[]>([]);
  const lastCandleTimeRef = useRef<number | null>(null);
  const updateCountRef = useRef(0);

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const candles = await fetchBinanceKlines(cryptoConfig.binanceSymbol, interval, limit);
      dataRef.current = candles;
      setData(candles);
      lastCandleTimeRef.current = Math.floor(Date.now() / 60000) * 60000;
    } catch (err) {
      setError('Failed to fetch candlestick data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [cryptoConfig.binanceSymbol, interval, limit]);

  // Update candles with batching to reduce re-renders
  const updateLatestCandle = useCallback((priceData: PriceData) => {
    updateCountRef.current++;
    
    // Only update the UI every 5 updates to reduce re-renders
    if (updateCountRef.current % 5 !== 0) {
      return;
    }
    
    const currentTime = Math.floor(Date.now() / 60000) * 60000;
    
    if (dataRef.current.length === 0) return;
    
    const newData = [...dataRef.current];
    const lastCandle = newData[newData.length - 1];
    
    // Check if we need to create a new candle
    if (!lastCandle || (lastCandleTimeRef.current && currentTime > lastCandleTimeRef.current)) {
      const newCandle: CandleData = {
        date: new Date(currentTime).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        openClose: [priceData.close, priceData.close],
        high: priceData.close,
        low: priceData.close
      };
      
      newData.push(newCandle);
      if (newData.length > limit) {
        newData.shift();
      }
      
      lastCandleTimeRef.current = currentTime;
    } else if (lastCandle) {
      // Update the last candle
      lastCandle.openClose[1] = priceData.close;
      lastCandle.high = Math.max(lastCandle.high, priceData.high);
      lastCandle.low = Math.min(lastCandle.low, priceData.low);
    }
    
    dataRef.current = newData;
    setData([...newData]);
  }, [limit]);

  // Set up WebSocket and initial data fetch
  useEffect(() => {
    fetchInitialData();
    
    // Subscribe to WebSocket with lower frequency updates
    const unsubscribe = subscribeToBinanceWebSocket(cryptoConfig.binanceSymbol, updateLatestCandle, '1s');
    
    return () => {
      unsubscribe();
    };
  }, [fetchInitialData, updateLatestCandle, cryptoConfig.binanceSymbol]);

  if (loading) {
    return (
      <div className="w-full h-110">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-110 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const minValue = data.reduce(
    (minValue: number | null, { low, openClose: [open, close] }) => {
      const currentMin = Math.min(low ?? 0, open ?? 0, close ?? 0);
      return minValue === null || currentMin < minValue ? currentMin : minValue;
    },
    null as number | null,
  );
  
  const maxValue = data.reduce(
    (maxValue: number, { high, openClose: [open, close] }) => {
      const currentMax = Math.max(high ?? 0, open ?? 0, close ?? 0);
      return maxValue === null || currentMax > maxValue ? currentMax : maxValue;
    },
    minValue || 0,
  );

  const mostRecentData = data[data.length - 1];
  const mostRecentClose = mostRecentData ? mostRecentData.openClose[1] : null;
  const isGrowing = mostRecentData && mostRecentData.openClose[1] > mostRecentData.openClose[0];

  return (
    <div className="w-full">
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-110 w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-zinc-950/5 dark:[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-zinc-950/25 [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/64 [&_.recharts-cartesian-axis-line]:stroke-border/64 [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground/72 dark:[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground/64"
      >
        <BarChart data={data} maxBarSize={20} margin={{ left: 20, right: -5, bottom: 60 }}>
          <CartesianGrid vertical={false} strokeWidth={1} />
          <XAxis
            dataKey="date"
            tickLine={false}
            interval={Math.floor(data.length / 6)}
            minTickGap={40}
            tickMargin={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            domain={[
              minValue !== null
                ? minValue - (maxValue - (minValue ?? 0)) * 0.1
                : 0,
              maxValue + (maxValue - (minValue ?? 0)) * 0.1,
            ]}
            tickCount={7}
            tickLine={false}
            orientation="right"
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />

          {mostRecentClose && (
            <ReferenceLine
              y={mostRecentClose}
              stroke="var(--muted-foreground)"
              opacity={0.5}
              strokeWidth={1}
              strokeDasharray="2 2"
              label={({ viewBox }) => (
                <g
                  transform={`translate(${viewBox.x + viewBox.width + 5},${viewBox.y})`}
                >
                  <rect
                    x={-2}
                    y={-10}
                    width={60}
                    height={20}
                    fill={
                      isGrowing
                        ? "var(--color-emerald-500)"
                        : "var(--color-rose-500)"
                    }
                    rx={4}
                  />
                  <text
                    x={4}
                    y={4}
                    fill="#fff"
                    fontSize={12}
                    fontWeight="500"
                    textAnchor="start"
                  >
                    ${mostRecentClose.toFixed(2)}
                  </text>
                </g>
              )}
            />
          )}

          <ChartTooltip content={<CustomTooltip />} />
          <Bar dataKey="openClose" shape={renderCandlestick}>
            {data.map(({ date }: any) => (
              <Cell key={`cell-${date}`} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export const LiveCandlestickChart = memo(LiveCandlestickChartComponent);