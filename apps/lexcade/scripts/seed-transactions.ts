import fs from 'fs/promises';
import path from 'path';
import { CRYPTO_CONFIGS } from '../contexts/crypto-context';

interface Transaction {
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

// Price ranges for each crypto (rough estimates)
const PRICE_RANGES = {
  BTC: { min: 30000, max: 70000 },
  ETH: { min: 1500, max: 4000 },
  SOL: { min: 20, max: 200 },
  BNB: { min: 200, max: 600 },
  XRP: { min: 0.3, max: 1.5 },
  ADA: { min: 0.2, max: 1.2 },
  DOGE: { min: 0.05, max: 0.4 },
  MATIC: { min: 0.5, max: 2.5 },
  DOT: { min: 4, max: 50 },
  AVAX: { min: 10, max: 100 },
};

// Generate random price within range
function getRandomPrice(symbol: string): number {
  const range = PRICE_RANGES[symbol as keyof typeof PRICE_RANGES] || { min: 1, max: 100 };
  return range.min + Math.random() * (range.max - range.min);
}

// Generate random amount based on crypto value (much smaller amounts)
function getRandomAmount(symbol: string): number {
  const price = getRandomPrice(symbol);
  if (price > 10000) return Math.random() * 0.0002; // BTC (0.0002 BTC max ~ $20)
  if (price > 1000) return Math.random() * 0.01; // ETH, BNB (0.01 ETH ~ $20)
  if (price > 100) return Math.random() * 0.1; // SOL, AVAX (0.1 SOL ~ $10)
  if (price > 10) return Math.random() * 1; // DOT (1 DOT ~ $10)
  if (price > 1) return Math.random() * 10; // MATIC, ADA (10 ADA ~ $10)
  return Math.random() * 100; // XRP, DOGE (100 XRP ~ $50)
}

// Generate transactions
async function generateTransactions(count: number): Promise<Transaction[]> {
  const transactions: Transaction[] = [];
  const cryptoSymbols = Object.keys(CRYPTO_CONFIGS);
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  // Track balances to ensure we don't sell more than we have
  const balances: Record<string, number> = {};
  cryptoSymbols.forEach(symbol => {
    balances[symbol] = 0;
  });
  
  // Generate initial deposits (buys) for each crypto
  cryptoSymbols.forEach(symbol => {
    const initialAmount = getRandomAmount(symbol) * 2; // Small initial buy
    const price = getRandomPrice(symbol);
    const usdAmount = initialAmount * price;
    const fee = usdAmount * 0.007;
    const timestamp = now - (89 * dayInMs) - Math.random() * dayInMs; // 89-90 days ago
    
    balances[symbol] += initialAmount;
    
    transactions.push({
      id: `tx_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'buy',
      cryptoSymbol: symbol,
      cryptoAmount: initialAmount,
      usdAmount,
      price,
      fee,
      total: usdAmount + fee,
      timestamp,
      status: 'completed',
    });
  });
  
  // Generate remaining transactions
  for (let i = cryptoSymbols.length; i < count; i++) {
    const cryptoSymbol = cryptoSymbols[Math.floor(Math.random() * cryptoSymbols.length)];
    
    // Decide type based on current balance
    let type: 'buy' | 'sell';
    if (balances[cryptoSymbol] <= 0.001) {
      type = 'buy'; // Must buy if balance is too low
    } else {
      type = Math.random() > 0.4 ? 'buy' : 'sell'; // 60% buy, 40% sell
    }
    
    // Calculate amount
    let cryptoAmount: number;
    if (type === 'buy') {
      cryptoAmount = getRandomAmount(cryptoSymbol);
    } else {
      // Sell up to 50% of current balance
      const maxSell = balances[cryptoSymbol] * 0.5;
      cryptoAmount = Math.min(getRandomAmount(cryptoSymbol), maxSell);
    }
    
    const price = getRandomPrice(cryptoSymbol);
    const usdAmount = cryptoAmount * price;
    const fee = usdAmount * 0.007;
    const total = type === 'buy' ? usdAmount + fee : usdAmount - fee;
    
    // Random timestamp within last 88 days (leaving room for initial buys)
    const daysAgo = Math.floor(Math.random() * 88);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const timestamp = now - (daysAgo * dayInMs) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000);
    
    // Random status (90% completed, 5% pending, 5% failed)
    const statusRandom = Math.random();
    const status = statusRandom < 0.9 ? 'completed' : statusRandom < 0.95 ? 'pending' : 'failed';
    
    // Update balance only if completed
    if (status === 'completed') {
      if (type === 'buy') {
        balances[cryptoSymbol] += cryptoAmount;
      } else {
        balances[cryptoSymbol] -= cryptoAmount;
      }
    }
    
    const transaction: Transaction = {
      id: `tx_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      cryptoSymbol,
      cryptoAmount,
      usdAmount,
      price,
      fee,
      total,
      timestamp,
      status,
    };
    
    transactions.push(transaction);
  }
  
  // Sort by timestamp (newest first)
  return transactions.sort((a, b) => b.timestamp - a.timestamp);
}

// Main seeder function
async function seed() {
  const transactionCount = 3020; // Generate 3020 transactions (151 pages × 20 per page)
  console.log(`🌱 Generating ${transactionCount} transactions...`);
  
  try {
    // Generate transactions
    const transactions = await generateTransactions(transactionCount);
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Write to file
    const filePath = path.join(dataDir, 'transactions.json');
    await fs.writeFile(filePath, JSON.stringify(transactions, null, 2));
    
    console.log(`✅ Successfully generated ${transactions.length} transactions`);
    console.log(`📁 Saved to: ${filePath}`);
    
    // Show some stats
    const cryptoStats = transactions.reduce((acc, tx) => {
      acc[tx.cryptoSymbol] = (acc[tx.cryptoSymbol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n📊 Transaction Statistics:');
    console.log('By Cryptocurrency:');
    Object.entries(cryptoStats).forEach(([symbol, count]) => {
      console.log(`  ${symbol}: ${count} transactions`);
    });
    
    const typeStats = transactions.reduce((acc, tx) => {
      acc[tx.type] = (acc[tx.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\nBy Type:');
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} transactions`);
    });
    
    const statusStats = transactions.reduce((acc, tx) => {
      acc[tx.status] = (acc[tx.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\nBy Status:');
    Object.entries(statusStats).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} transactions`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding transactions:', error);
    process.exit(1);
  }
}

// Run seeder
seed();