"use client";

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  RiArrowRightLine,
  RiCheckLine,
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "@remixicon/react";
import { buttonVariants } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { useTransactionsPaginated } from "@/hooks/use-transactions-paginated";
import { CRYPTO_CONFIGS } from "@/contexts/crypto-context";

const TransactionsTablePaginatedComponent = () => {
  const {
    transactions,
    loading,
    error,
    page,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  } = useTransactionsPaginated(20);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

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

  if (loading && transactions.length === 0) {
    return (
      <Card className="gap-4">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            Loading transactions...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="gap-4">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <Table className="px-6 border-separate border-spacing-0 [&_tr_td]:border-b [&_tr_td]:border-border/64 dark:[&_tr_td]:border-card/80">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-0">
              <TableHead className="relative h-8 select-none bg-muted dark:bg-card/48 border-0 first:rounded-l-lg last:rounded-r-lg font-normal">
                Date
              </TableHead>
              <TableHead className="relative h-8 select-none bg-muted dark:bg-card/48 border-0 first:rounded-l-lg last:rounded-r-lg font-normal">
                Type
              </TableHead>
              <TableHead className="relative h-8 select-none bg-muted dark:bg-card/48 border-0 first:rounded-l-lg last:rounded-r-lg font-normal">
                Cryptocurrency
              </TableHead>
              <TableHead className="relative h-8 select-none bg-muted dark:bg-card/48 border-0 first:rounded-l-lg last:rounded-r-lg font-normal">
                Amount
              </TableHead>
              <TableHead className="relative h-8 select-none bg-muted dark:bg-card/48 border-0 first:rounded-l-lg last:rounded-r-lg font-normal">
                Price
              </TableHead>
              <TableHead className="relative h-8 select-none bg-muted dark:bg-card/48 border-0 first:rounded-l-lg last:rounded-r-lg font-normal">
                Fee
              </TableHead>
              <TableHead className="relative h-8 select-none bg-muted dark:bg-card/48 border-0 first:rounded-l-lg last:rounded-r-lg font-normal">
                Total
              </TableHead>
              <TableHead className="relative h-8 select-none bg-muted dark:bg-card/48 border-0 first:rounded-l-lg last:rounded-r-lg font-normal text-center">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => {
              const cryptoConfig = CRYPTO_CONFIGS[tx.cryptoSymbol];
              const cryptoName = cryptoConfig?.name || tx.cryptoSymbol;
              const Icon = cryptoConfig?.icon;
              
              return (
                <TableRow key={tx.id} className="hover:bg-transparent">
                  <TableCell className="text-foreground/70 whitespace-nowrap">
                    {formatDate(tx.timestamp)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "text-sm font-normal border-0 py-0.5 px-2",
                        tx.type === 'buy'
                          ? "bg-emerald-500/12 text-emerald-600"
                          : "bg-blue-500/12 text-blue-600"
                      )}
                    >
                      {tx.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {Icon && (
                        <Icon className="h-5 w-5" />
                      )}
                      <span>{cryptoName}</span>
                      <span className="text-muted-foreground">({tx.cryptoSymbol})</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground/70">
                    {formatCryptoAmount(tx.cryptoAmount, tx.cryptoSymbol)}
                  </TableCell>
                  <TableCell className="text-foreground/70">
                    {formatCurrency(tx.price)}
                  </TableCell>
                  <TableCell className="text-foreground/70">
                    {formatCurrency(tx.fee)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(tx.total)}
                  </TableCell>
                  <TableCell className="text-center">
                    {tx.status === "completed" && (
                      <>
                        <span className="sr-only">Completed</span>
                        <RiCheckLine
                          size={16}
                          className="inline-flex text-emerald-500"
                        />
                      </>
                    )}
                    {tx.status === "pending" && (
                      <>
                        <span className="sr-only">Pending</span>
                        <div className="inline-flex h-4 w-4 rounded-full bg-yellow-500/20 animate-pulse" />
                      </>
                    )}
                    {tx.status === "failed" && (
                      <>
                        <span className="sr-only">Failed</span>
                        <RiCloseLine
                          size={16}
                          className="inline-flex text-red-500"
                        />
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {transactions.length === 0 && (
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            No transactions found
          </div>
        )}
        
        {totalPages > 1 && (
          <Pagination className="mt-5 px-6">
            <PaginationContent className="w-full justify-between">
              <PaginationItem>
                <Button
                  onClick={prevPage}
                  disabled={!hasPrevPage}
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                    }),
                    "size-8 p-0 aria-disabled:pointer-events-none aria-disabled:text-muted-foreground/50 border-none hover:bg-muted/50 dark:bg-card/64 dark:hover:bg-card/80 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0_1px_1px_rgba(0,0,0,0.05),0_2px_2px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.05)] dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]",
                  )}
                  aria-label="Go to previous page"
                >
                  <RiArrowLeftSLine
                    className="size-5"
                    size={20}
                    aria-hidden="true"
                  />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <p className="text-muted-foreground text-sm" aria-live="polite">
                  Page <span className="text-foreground">{page}</span> of{" "}
                  <span className="text-foreground">{totalPages}</span>
                </p>
              </PaginationItem>
              <PaginationItem>
                <Button
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                    }),
                    "size-8 p-0 aria-disabled:pointer-events-none aria-disabled:text-muted-foreground/50 border-none hover:bg-muted/50 dark:bg-card/64 dark:hover:bg-card/80 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0_1px_1px_rgba(0,0,0,0.05),0_2px_2px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.05)] dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]",
                  )}
                  aria-label="Go to next page"
                >
                  <RiArrowRightSLine
                    className="size-5"
                    size={20}
                    aria-hidden="true"
                  />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
};

export const TransactionsTablePaginated = memo(TransactionsTablePaginatedComponent);