import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'transactions.json');

// Read transactions from file
async function readTransactions() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write transactions to file
async function writeTransactions(transactions: any[]) {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(transactions, null, 2));
}

// GET single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transactions = await readTransactions();
    const transaction = transactions.find((t: any) => t.id === id);
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read transaction' }, { status: 500 });
  }
}

// PUT update transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const transactions = await readTransactions();
    const index = transactions.findIndex((t: any) => t.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    transactions[index] = { ...transactions[index], ...updates };
    await writeTransactions(transactions);
    
    return NextResponse.json(transactions[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

// DELETE single transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transactions = await readTransactions();
    const filtered = transactions.filter((t: any) => t.id !== id);
    
    if (filtered.length === transactions.length) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    await writeTransactions(filtered);
    return NextResponse.json({ message: 'Transaction deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}