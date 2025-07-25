"use client";

import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionAPI } from '@/lib/transactions-api';

export function useTransactionsAPI() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load transactions
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await TransactionAPI.getTransactions();
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx = await TransactionAPI.createTransaction(transaction);
    if (newTx) {
      await loadTransactions(); // Reload to get updated list
      return newTx;
    }
    return null;
  }, [loadTransactions]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    const updated = await TransactionAPI.updateTransaction(id, updates);
    if (updated) {
      await loadTransactions();
      return updated;
    }
    return null;
  }, [loadTransactions]);

  const deleteTransaction = useCallback(async (id: string) => {
    const success = await TransactionAPI.deleteTransaction(id);
    if (success) {
      await loadTransactions();
    }
    return success;
  }, [loadTransactions]);

  const clearTransactions = useCallback(async () => {
    const success = await TransactionAPI.deleteAllTransactions();
    if (success) {
      setTransactions([]);
    }
    return success;
  }, []);

  const exportTransactions = useCallback(async () => {
    await TransactionAPI.exportTransactions();
  }, []);

  const importTransactions = useCallback(async (file: File) => {
    const success = await TransactionAPI.importTransactions(file);
    if (success) {
      await loadTransactions();
    }
    return success;
  }, [loadTransactions]);

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearTransactions,
    exportTransactions,
    importTransactions,
    refresh: loadTransactions,
  };
}