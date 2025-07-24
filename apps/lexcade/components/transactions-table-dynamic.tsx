"use client";

import { memo, useState } from "react";
import { useTransactions } from "@/hooks/use-transactions";
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
import { RiDeleteBinLine, RiRefreshLine } from "@remixicon/react";
import { cn } from "@/lib/utils";

const TransactionsTableComponent = () => {
  const { transactions, loading, deleteTransaction, clearTransactions, refresh } = useTransactions();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    deleteTransaction(id);
    setDeletingId(null);
  };

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

  return (
    <Card className="shadow-2xl rounded-3xl border-transparent dark:border-border/64">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={refresh}
            className="h-8"
          >
            <RiRefreshLine className="h-4 w-4" />
          </Button>
          {transactions.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearTransactions}
              className="h-8 text-destructive hover:text-destructive"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No transactions yet. Start trading to see your history.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow
                  key={tx.id}
                  className={cn(
                    "transition-opacity",
                    deletingId === tx.id && "opacity-50"
                  )}
                >
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
                        "capitalize",
                        tx.status === 'completed' && "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
                        tx.status === 'pending' && "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
                        tx.status === 'failed' && "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                      )}
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(tx.id)}
                      disabled={deletingId === tx.id}
                    >
                      <RiDeleteBinLine className="h-4 w-4" />
                    </Button>
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