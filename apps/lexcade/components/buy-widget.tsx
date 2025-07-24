"use client";

import { useState, memo, useRef, useEffect } from "react";
import { useCrypto } from "@/contexts/crypto-context";
import { usePriceUpdates } from "@/hooks/use-price-updates";
import { useTransactionsAPI } from "@/hooks/use-transactions-api";
import { PriceTicker } from "@/components/price-ticker-isolated";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RiArrowDownLine } from "@remixicon/react";
import { I18nProvider, Input, Label, NumberField } from "react-aria-components";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConverterFieldProps {
  className?: string;
  isLast?: boolean;
  value?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  balance: string;
  currency: string;
  currencyImage: string;
  disableSelect?: boolean;
}

const ConverterField = memo(({
  className,
  isLast,
  value,
  onChange,
  readOnly = false,
  balance,
  currency,
  currencyImage,
  disableSelect = false,
}: ConverterFieldProps) => {
  return (
    <>
      {isLast && (
        <div
          className="size-10 flex items-center justify-center rounded-full bg-linear-to-b from-primary to-primary-to inset-shadow-[0_1px_rgb(255_255_255/0.15)] absolute top-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <RiArrowDownLine className="text-primary-foreground" size={20} />
        </div>
      )}
      <Card
        className={cn(
          "relative w-full flex-row items-center justify-between gap-2 p-5 dark:bg-card/64",
          isLast
            ? "[mask-image:radial-gradient(ellipse_26px_24px_at_50%_0%,transparent_0,_transparent_24px,_black_25px)]"
            : "[mask-image:radial-gradient(ellipse_26px_24px_at_50%_100%,transparent_0,_transparent_24px,_black_25px)]",
          className,
        )}
      >
        {isLast && (
          <div
            className="absolute -top-px left-1/2 -translate-x-1/2 w-[50px] h-[25px] rounded-b-full border-b border-x border-white/15"
            aria-hidden="true"
          ></div>
        )}
        <div className="grow">
          {readOnly ? (
            <div className="w-full max-w-40 text-2xl font-semibold bg-transparent py-0.5 px-1 -ml-1 mb-0.5 tabular-nums">
              ${value?.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          ) : (
            <I18nProvider locale="en-US">
              <NumberField
                value={value}
                onChange={onChange}
                minValue={0}
                formatOptions={{
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 6,
                  useGrouping: true,
                }}
              >
                <Label className="sr-only">Amount</Label>
                <Input className="w-full max-w-40 text-2xl font-semibold bg-transparent focus-visible:outline-none py-0.5 px-1 -ml-1 mb-0.5 focus:bg-card/64 rounded-lg appearance-none" />
              </NumberField>
            </I18nProvider>
          )}
          <div className="text-xs text-muted-foreground">
            <span className="text-muted-foreground/70">Balance: </span>
            {balance}
          </div>
        </div>
        <div>
          <Select value={currency} disabled={disableSelect}>
            <SelectTrigger className="p-1 pr-2 h-8 rounded-full [&>span_svg]:text-muted-foreground/80 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0 border-0 bg-card/64 hover:bg-card/80 shadow-lg inset-shadow-[0_1px_rgb(255_255_255/0.15)] disabled:opacity-100 disabled:cursor-default">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {currency === 'USDC' ? (
                    <div className="shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">$</span>
                    </div>
                  ) : (
                    <img
                      className="shrink-0 rounded-full shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0_1px_1px_rgba(0,0,0,0.05),0_2px_2px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.05)]"
                      src={currencyImage}
                      width={24}
                      height={24}
                      alt={currency}
                    />
                  )}
                  <span className="truncate uppercase text-xs font-medium">
                    {currency}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
          </Select>
        </div>
      </Card>
    </>
  );
});

ConverterField.displayName = 'ConverterField';

// Isolated summary component that updates with live price
const BuySummary = memo(({ cryptoAmount, cryptoSymbol, onReset }: { cryptoAmount: number; cryptoSymbol: string; onReset: () => void }) => {
  const { cryptoConfig } = useCrypto();
  const { price } = usePriceUpdates(cryptoConfig.binanceSymbol);
  const { addTransaction } = useTransactionsAPI();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const usdAmount = cryptoAmount * price;
  const platformFee = usdAmount * 0.007;
  const totalAmount = usdAmount + platformFee;
  
  const handleBuy = async () => {
    if (cryptoAmount === 0 || isProcessing) return;
    
    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create transaction
    addTransaction({
      type: 'buy',
      cryptoSymbol: cryptoConfig.symbol,
      cryptoAmount,
      usdAmount,
      price,
      fee: platformFee,
      total: totalAmount,
      status: 'completed',
    });
    
    // Reset form
    onReset();
    setIsProcessing(false);
  };
  
  return (
    <>
      <ul className="text-sm">
        <li className="flex items-center justify-between pb-3 mb-3 border-b border-card/50">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium">{cryptoAmount.toFixed(2)} {cryptoSymbol}</span>
        </li>
        <li className="flex items-center justify-between pb-3 mb-3 border-b border-card/50">
          <span className="text-muted-foreground">Platform Fee</span>
          <span className="font-medium">${platformFee.toFixed(2)}</span>
        </li>
        <li className="flex items-center justify-between pb-3 mb-3 border-b border-card/50">
          <span className="text-muted-foreground">Total</span>
          <span className="font-medium">${totalAmount.toFixed(2)}</span>
        </li>
      </ul>
      <Button 
        size="lg" 
        className="w-full" 
        disabled={cryptoAmount === 0 || isProcessing}
        onClick={handleBuy}
      >
        {isProcessing ? 'Processing...' : `Buy ${cryptoSymbol}`}
      </Button>
    </>
  );
});

BuySummary.displayName = 'BuySummary';

// Isolated USD display that updates with live price
const UsdDisplay = memo(({ cryptoAmount }: { cryptoAmount: number }) => {
  const { cryptoConfig } = useCrypto();
  const { price } = usePriceUpdates(cryptoConfig.binanceSymbol);
  const usdAmount = cryptoAmount * price;
  
  return (
    <ConverterField
      isLast
      value={usdAmount}
      readOnly
      balance="$0.00"
      currency="USDC"
      currencyImage=""
      disableSelect
    />
  );
});

UsdDisplay.displayName = 'UsdDisplay';

export const BuyWidget = memo(() => {
  const { cryptoConfig } = useCrypto();
  const [cryptoAmount, setCryptoAmount] = useState<number>(0);
  
  const handleReset = () => {
    setCryptoAmount(0);
  };
  
  return (
    <>
      <div className="relative flex flex-col items-center gap-1 mb-4">
        <ConverterField
          value={cryptoAmount}
          onChange={setCryptoAmount}
          balance="0.00"
          currency={cryptoConfig.symbol}
          currencyImage={cryptoConfig.logo}
          disableSelect
        />
        <UsdDisplay cryptoAmount={cryptoAmount} />
      </div>
      <div className="mb-2 ps-3 uppercase text-muted-foreground/50 text-xs font-medium">
        Summary
      </div>
      <Card className="p-4 gap-0 rounded-[0.75rem]">
        <BuySummary cryptoAmount={cryptoAmount} cryptoSymbol={cryptoConfig.symbol} onReset={handleReset} />
        <PriceTicker binanceSymbol={cryptoConfig.binanceSymbol} symbol={cryptoConfig.symbol} />
      </Card>
    </>
  );
});

BuyWidget.displayName = 'BuyWidget';