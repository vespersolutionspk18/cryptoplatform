"use client";

import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionManager } from '@/lib/transactions';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Load transactions
  const loadTransactions = useCallback(() => {
    const txs = TransactionManager.getTransactions();
    setTransactions(txs);
    setLoading(false);
  }, []);

  // Listen for transaction updates
  useEffect(() => {
    loadTransactions();

    const handleUpdate = () => {
      loadTransactions();
    };

    window.addEventListener('transactionUpdate', handleUpdate);
    return () => window.removeEventListener('transactionUpdate', handleUpdate);
  }, [loadTransactions]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    return TransactionManager.saveTransaction(transaction);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    return TransactionManager.deleteTransaction(id);
  }, []);

  const clearTransactions = useCallback(() => {
    TransactionManager.clearTransactions();
  }, []);

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    clearTransactions,
    refresh: loadTransactions,
  };
}