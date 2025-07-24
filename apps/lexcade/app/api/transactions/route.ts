import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'transactions.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Read transactions from file
async function readTransactions() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return empty array if file doesn't exist
    return [];
  }
}

// Write transactions to file
async function writeTransactions(transactions: any[]) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(transactions, null, 2));
}

// GET all transactions with pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const allTransactions = await readTransactions();
    const total = allTransactions.length;
    const transactions = allTransactions.slice(skip, skip + limit);
    
    return NextResponse.json({
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read transactions' }, { status: 500 });
  }
}

// POST new transaction
export async function POST(request: NextRequest) {
  try {
    const transaction = await request.json();
    const transactions = await readTransactions();
    
    // Add ID and timestamp if not provided
    const newTransaction = {
      ...transaction,
      id: transaction.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: transaction.timestamp || Date.now(),
    };
    
    transactions.unshift(newTransaction);
    await writeTransactions(transactions);
    
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}

// DELETE all transactions
export async function DELETE() {
  try {
    await writeTransactions([]);
    return NextResponse.json({ message: 'All transactions deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete transactions' }, { status: 500 });
  }
}