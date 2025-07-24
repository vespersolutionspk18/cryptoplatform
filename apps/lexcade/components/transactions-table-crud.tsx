"use client";

import { memo } from "react";
import { useTransactionsAPI } from "@/hooks/use-transactions-api";
import { CRYPTO_CONFIGS } from "@/contexts/crypto-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RiRefreshLine, 
  RiFileTextLine 
} from "@remixicon/react";
import { cn } from "@/lib/utils";

const TransactionsTableComponent = () => {
  const { 
    transactions, 
    loading, 
    error,
    refresh 
  } = useTransactionsAPI();

  const getCryptoLogo = (symbol: string) => {
    const config = CRYPTO_CONFIGS[symbol as keyof typeof CRYPTO_CONFIGS];
    return config?.logo || '';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card className="shadow-2xl rounded-3xl border-transparent dark:border-border/64">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-2xl rounded-3xl border-transparent dark:border-border/64">
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            {error}
            <Button onClick={refresh} className="ml-2" size="sm">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xl rounded-3xl border-transparent dark:border-border/64">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <RiFileTextLine className="h-5 w-5" />
          Transaction History
        </CardTitle>
        <Button
          size="sm"
          variant="ghost"
          onClick={refresh}
          className="h-8"
        >
          <RiRefreshLine className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <RiFileTextLine className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No transactions yet. Start trading to see your history.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Fee</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <Badge
                      variant={tx.type === 'buy' ? 'default' : 'secondary'}
                      className={cn(
                        "capitalize",
                        tx.type === 'buy' && "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                      )}
                    >
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={getCryptoLogo(tx.cryptoSymbol)}
                        alt={tx.cryptoSymbol}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="font-medium">{tx.cryptoSymbol}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {tx.cryptoAmount.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${tx.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ${tx.fee.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${tx.total.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(tx.timestamp)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tx.status === 'completed' ? 'default' :
                        tx.status === 'pending' ? 'secondary' : 'destructive'
                      }
                      className={cn(
                        "capitalize text-xs",
                        tx.status === 'completed' && "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
                        tx.status === 'pending' && "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
                        tx.status === 'failed' && "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                      )}
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export const TransactionsTable = memo(TransactionsTableComponent);