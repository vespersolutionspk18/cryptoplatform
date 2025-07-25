"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWalletBalances } from "@/hooks/use-wallet-balances";
import { CRYPTO_CONFIGS } from "@/contexts/crypto-context";
import { RiArrowUpLine, RiArrowDownLine, RiLineChartLine, RiWalletLine } from "@remixicon/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const WalletContentComponent = () => {
  const { balances, stats, loading, error } = useWalletBalances();

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `$${formatted} USDC`;
  };

  const formatCryptoAmount = (amount: number, symbol: string) => {
    const decimals = symbol === 'BTC' ? 8 : symbol === 'ETH' ? 6 : 4;
    return amount.toFixed(decimals);
  };

  const formatPercentage = (value: number) => {
    if (value === undefined || value === null || isNaN(value)) return '0.00%';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                Loading wallet data...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                {error}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
                  <h2 className="text-3xl font-bold">{formatCurrency(stats.totalValue)}</h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">24h Change</p>
                  <div className="flex items-center gap-2 justify-end">
                    {stats.totalChange24h >= 0 ? (
                      <RiArrowUpLine className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <RiArrowDownLine className="h-4 w-4 text-red-500" />
                    )}
                    <span className={cn(
                      "text-lg font-semibold",
                      stats.totalChange24h >= 0 ? "text-emerald-500" : "text-red-500"
                    )}>
                      {formatCurrency(Math.abs(stats.totalChange24h))}
                    </span>
                    <Badge 
                      className={cn(
                        "ml-2",
                        stats.totalChangePercent24h >= 0 
                          ? "bg-emerald-500/12 text-emerald-600 border-0" 
                          : "bg-red-500/12 text-red-500 border-0"
                      )}
                    >
                      {formatPercentage(stats.totalChangePercent24h)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Asset Allocation</h3>
                <div className="space-y-3">
                  {balances.slice(0, 5).map((balance) => (
                    <div key={balance.symbol} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const logoUrl = CRYPTO_CONFIGS[balance.symbol as keyof typeof CRYPTO_CONFIGS]?.logo;
                            return logoUrl ? <img src={logoUrl} className="h-4 w-4" alt={balance.symbol} /> : null;
                          })()}
                          <span className="font-medium">{balance.symbol}</span>
                        </div>
                        <span className="text-muted-foreground">{balance.allocation.toFixed(1)}%</span>
                      </div>
                      <Progress value={balance.allocation} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {balances.map((balance) => {
                const logoUrl = CRYPTO_CONFIGS[balance.symbol as keyof typeof CRYPTO_CONFIGS]?.logo;
                return (
                  <Link
                    key={balance.symbol}
                    href={`/?crypto=${balance.symbol}`}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {logoUrl && (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <img src={logoUrl} className="h-5 w-5" alt={balance.symbol} />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">{balance.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatCryptoAmount(balance.amount, balance.symbol)} {balance.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(balance.usdValue)}</p>
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-sm text-muted-foreground">
                          @ {formatCurrency(balance.price)}
                        </span>
                        <Badge 
                          className={cn(
                            "ml-2 text-xs",
                            balance.change24h >= 0 
                              ? "bg-emerald-500/12 text-emerald-600 border-0" 
                              : "bg-red-500/12 text-red-500 border-0"
                          )}
                        >
                          {formatPercentage(balance.change24h)}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {balances.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <RiWalletLine className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No assets in your wallet yet</p>
                  <p className="text-sm mt-1">Start trading to build your portfolio</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <RiWalletLine className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Assets</p>
                  <p className="text-lg font-semibold">{balances.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <RiArrowUpLine className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Best Performer</p>
                  <p className="text-lg font-semibold">
                    {balances.length > 0 
                      ? balances.reduce((best, current) => 
                          current.change24h > best.change24h ? current : best
                        ).symbol
                      : '-'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <RiLineChartLine className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Largest Holding</p>
                  <p className="text-lg font-semibold">
                    {balances.length > 0 ? balances[0]?.symbol ?? '-' : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const WalletContent = memo(WalletContentComponent);