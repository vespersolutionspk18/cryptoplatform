export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  cryptoSymbol: string;
  cryptoAmount: number;
  usdAmount: number; // Amount in USDC (kept as usdAmount for backwards compatibility)
  price: number; // Price in USDC per crypto
  fee: number; // Platform fee in USDC
  total: number; // Total amount in USDC
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class TransactionAPI {
  static async getTransactions(page = 1, limit = 20): Promise<PaginatedResponse<Transaction>> {
    try {
      const response = await fetch(`/api/transactions?page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0 },
      };
    }
  }

  static async getTransaction(id: string): Promise<Transaction | null> {
    try {
      const response = await fetch(`/api/transactions/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  static async createTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction | null> {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) throw new Error('Failed to create transaction');
      return await response.json();
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  }

  static async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update transaction');
      return await response.json();
    } catch (error) {
      console.error('Error updating transaction:', error);
      return null;
    }
  }

  static async deleteTransaction(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  }

  static async deleteAllTransactions(): Promise<boolean> {
    try {
      const response = await fetch('/api/transactions', {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting all transactions:', error);
      return false;
    }
  }

  static async exportTransactions(): Promise<void> {
    try {
      const response = await fetch('/api/transactions/export');
      if (!response.ok) throw new Error('Failed to export transactions');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting transactions:', error);
    }
  }

  static async importTransactions(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const transactions = JSON.parse(text);
      
      // Validate the data
      if (!Array.isArray(transactions)) {
        throw new Error('Invalid file format');
      }
      
      // Create each transaction
      for (const tx of transactions) {
        await this.createTransaction(tx);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing transactions:', error);
      return false;
    }
  }
}