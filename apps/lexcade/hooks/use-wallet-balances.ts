"use client";

import { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionAPI } from '@/lib/transactions-api';
import { usePriceUpdates } from '@/hooks/use-price-updates';
import { CRYPTO_CONFIGS } from '@/contexts/crypto-context';

export interface WalletBalance {
  symbol: string;
  name: string;
  amount: number;
  usdValue: number;
  price: number;
  change24h: number;
  allocation: number;
}

export interface WalletStats {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent24h: number;
}

export function useWalletBalances() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get live prices for all cryptocurrencies
  const btcData = usePriceUpdates('BTC');
  const ethData = usePriceUpdates('ETH');
  const solData = usePriceUpdates('SOL');
  const bnbData = usePriceUpdates('BNB');
  const xrpData = usePriceUpdates('XRP');
  const adaData = usePriceUpdates('ADA');
  const dogeData = usePriceUpdates('DOGE');
  const maticData = usePriceUpdates('MATIC');
  const dotData = usePriceUpdates('DOT');
  const avaxData = usePriceUpdates('AVAX');

  const priceMap = {
    BTC: { price: btcData.price, change24h: btcData.priceChange24h },
    ETH: { price: ethData.price, change24h: ethData.priceChange24h },
    SOL: { price: solData.price, change24h: solData.priceChange24h },
    BNB: { price: bnbData.price, change24h: bnbData.priceChange24h },
    XRP: { price: xrpData.price, change24h: xrpData.priceChange24h },
    ADA: { price: adaData.price, change24h: adaData.priceChange24h },
    DOGE: { price: dogeData.price, change24h: dogeData.priceChange24h },
    MATIC: { price: maticData.price, change24h: maticData.priceChange24h },
    DOT: { price: dotData.price, change24h: dotData.priceChange24h },
    AVAX: { price: avaxData.price, change24h: avaxData.priceChange24h },
  };

  // Load all transactions
  useEffect(() => {
    const loadAllTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if we're in the browser
        if (typeof window === 'undefined') {
          return;
        }
        
        // Fetch all transactions - we'll paginate through them
        const allTransactions: Transaction[] = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore && page <= 50) { // Limit to 50 pages to prevent infinite loop
          try {
            const response = await TransactionAPI.getTransactions(page, 100);
            if (response && response.data) {
              allTransactions.push(...response.data);
              hasMore = page < response.pagination.totalPages;
              page++;
            } else {
              hasMore = false;
            }
          } catch (pageError) {
            console.error(`Error fetching page ${page}:`, pageError);
            hasMore = false;
          }
        }
        
        setTransactions(allTransactions);
        setError(null);
      } catch (err) {
        console.error('Failed to load transactions:', err);
        // Don't show error if it's just a network issue during development
        if (!transactions.length) {
          setError('Unable to load transaction history. Make sure the server is running.');
        }
      } finally {
        setLoading(false);
      }
    };

    // Small delay to ensure component is mounted
    const timer = setTimeout(() => {
      loadAllTransactions();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Calculate balances from transactions
  const balances = useMemo(() => {
    const balanceMap: Record<string, number> = {};
    
    // Initialize all cryptocurrencies with 0 balance
    Object.keys(CRYPTO_CONFIGS).forEach(symbol => {
      balanceMap[symbol] = 0;
    });
    
    // Calculate net balance for each crypto
    transactions.forEach(tx => {
      if (tx.status === 'completed') {
        // Buy adds to balance, sell subtracts
        if (tx.type === 'buy') {
          balanceMap[tx.cryptoSymbol] = (balanceMap[tx.cryptoSymbol] || 0) + tx.cryptoAmount;
        } else {
          balanceMap[tx.cryptoSymbol] = (balanceMap[tx.cryptoSymbol] || 0) - tx.cryptoAmount;
        }
      }
    });

    // Convert to array with current values
    const balanceArray: WalletBalance[] = [];
    let totalValue = 0;

    Object.entries(balanceMap).forEach(([symbol, amount]) => {
      const priceData = priceMap[symbol as keyof typeof priceMap];
      const currentPrice = priceData?.price || 0;
      const change24h = priceData?.change24h || 0;
      const usdValue = amount * currentPrice;
      
      // Only add positive values to total
      if (usdValue > 0) {
        totalValue += usdValue;
      }

      balanceArray.push({
        symbol,
        name: CRYPTO_CONFIGS[symbol as keyof typeof CRYPTO_CONFIGS]?.name || symbol,
        amount,
        usdValue,
        price: currentPrice,
        change24h,
        allocation: 0, // Will calculate after total
      });
    });

    // Calculate allocation percentages
    balanceArray.forEach(balance => {
      balance.allocation = totalValue > 0 ? (balance.usdValue / totalValue) * 100 : 0;
    });

    // Sort by USD value descending
    balanceArray.sort((a, b) => b.usdValue - a.usdValue);

    return balanceArray;
  }, [transactions, priceMap]);

  // Calculate portfolio stats
  const stats: WalletStats = useMemo(() => {
    const totalValue = balances.reduce((sum, balance) => sum + (balance.usdValue || 0), 0);
    
    // Calculate what the portfolio was worth 24h ago
    const totalValue24hAgo = balances.reduce((sum, balance) => {
      const currentValue = balance.usdValue || 0;
      const changePercent = balance.change24h || 0;
      // If price went up 10%, then 24h ago it was currentValue / 1.10
      // If price went down 10%, then 24h ago it was currentValue / 0.90
      const value24hAgo = changePercent !== 0 ? currentValue / (1 + changePercent / 100) : currentValue;
      return sum + value24hAgo;
    }, 0);
    
    const totalChange24h = totalValue - totalValue24hAgo;
    const totalChangePercent24h = totalValue24hAgo > 0 ? ((totalValue - totalValue24hAgo) / totalValue24hAgo) * 100 : 0;
    
    console.log('Portfolio stats:', {
      totalValue,
      totalValue24hAgo,
      totalChange24h,
      totalChangePercent24h,
      balances: balances.map(b => ({ symbol: b.symbol, value: b.usdValue, change24h: b.change24h }))
    });

    return {
      totalValue,
      totalChange24h,
      totalChangePercent24h,
    };
  }, [balances]);

  return {
    balances,
    stats,
    loading,
    error,
  };
}