import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PREFERENCES_FILE = path.join(process.cwd(), 'data', 'preferences.json');

// Default preferences
const DEFAULT_PREFERENCES = {
  trading: {
    defaultOrderType: 'market',
    defaultAmount: 100,
    slippageTolerance: 0.5,
    oneClickTrading: false,
    showOrderBook: true,
    advancedCharts: false
  }
};

// Ensure data directory exists
async function ensureDataDir() {
  const dir = path.dirname(PREFERENCES_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Read preferences from file
async function readPreferences() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(PREFERENCES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return default preferences if file doesn't exist
    return DEFAULT_PREFERENCES;
  }
}

// Write preferences to file
async function writePreferences(preferences: any) {
  await ensureDataDir();
  await fs.writeFile(PREFERENCES_FILE, JSON.stringify(preferences, null, 2));
}

// GET preferences
export async function GET() {
  try {
    const preferences = await readPreferences();
    return NextResponse.json(preferences);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read preferences' }, { status: 500 });
  }
}

// POST/PUT update preferences
export async function POST(request: NextRequest) {
  try {
    const updates = await request.json();
    const currentPreferences = await readPreferences();
    
    // Merge updates with current preferences
    const newPreferences = {
      ...currentPreferences,
      ...updates,
      trading: {
        ...currentPreferences.trading,
        ...(updates.trading || {})
      }
    };
    
    await writePreferences(newPreferences);
    
    return NextResponse.json(newPreferences);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}