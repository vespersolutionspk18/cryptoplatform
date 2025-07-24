export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  cryptoSymbol: string;
  cryptoAmount: number;
  usdAmount: number;
  price: number;
  fee: number;
  total: number;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
}

const STORAGE_KEY = 'lexcade_transactions';

export class TransactionManager {
  static getTransactions(): Transaction[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static saveTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Transaction {
    const transactions = this.getTransactions();
    
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    transactions.unshift(newTransaction); // Add to beginning
    
    // Keep only last 100 transactions
    const trimmed = transactions.slice(0, 100);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    
    // Dispatch custom event so components can listen for updates
    window.dispatchEvent(new CustomEvent('transactionUpdate', { detail: newTransaction }));
    
    return newTransaction;
  }

  static deleteTransaction(id: string): boolean {
    const transactions = this.getTransactions();
    const filtered = transactions.filter(tx => tx.id !== id);
    
    if (filtered.length !== transactions.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('transactionUpdate'));
      return true;
    }
    
    return false;
  }

  static clearTransactions(): void {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('transactionUpdate'));
  }

  static updateTransactionStatus(id: string, status: Transaction['status']): boolean {
    const transactions = this.getTransactions();
    const transaction = transactions.find(tx => tx.id === id);
    
    if (transaction) {
      transaction.status = status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      window.dispatchEvent(new CustomEvent('transactionUpdate'));
      return true;
    }
    
    return false;
  }
}