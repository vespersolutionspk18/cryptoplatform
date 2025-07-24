"use client";

import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionAPI, PaginatedResponse } from '@/lib/transactions-api';

export function useTransactionsPaginated(initialLimit = 20) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  // Load transactions for current page
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await TransactionAPI.getTransactions(page, limit);
      setTransactions(response.data);
      setPagination({
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      });
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  // Load when page changes
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx = await TransactionAPI.createTransaction(transaction);
    if (newTx) {
      // If on first page, reload to show new transaction
      if (page === 1) {
        await loadTransactions();
      } else {
        // Go to first page to see new transaction
        setPage(1);
      }
      return newTx;
    }
    return null;
  }, [loadTransactions, page]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  }, [pagination.totalPages]);

  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [page, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(page - 1);
  }, [page, goToPage]);

  return {
    transactions,
    loading,
    error,
    page,
    limit,
    total: pagination.total,
    totalPages: pagination.totalPages,
    hasNextPage: page < pagination.totalPages,
    hasPrevPage: page > 1,
    addTransaction,
    goToPage,
    nextPage,
    prevPage,
    refresh: loadTransactions,
  };
}