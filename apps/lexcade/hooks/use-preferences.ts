"use client";

import { useState, useEffect, useCallback } from 'react';

export interface TradingPreferences {
  defaultOrderType: string;
  defaultAmount: number;
  slippageTolerance: number;
  oneClickTrading: boolean;
  showOrderBook: boolean;
  advancedCharts: boolean;
}

export interface Preferences {
  trading: TradingPreferences;
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load preferences
  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/preferences');
      if (!response.ok) throw new Error('Failed to load preferences');
      const data = await response.json();
      setPreferences(data);
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save preferences
  const savePreferences = useCallback(async (updates: Partial<Preferences>) => {
    try {
      setSaving(true);
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to save preferences');
      const data = await response.json();
      setPreferences(data);
      return true;
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  // Update trading preferences
  const updateTradingPreferences = useCallback(async (updates: Partial<TradingPreferences>) => {
    const currentTrading = preferences?.trading || {};
    return savePreferences({
      trading: { ...currentTrading, ...updates } as TradingPreferences
    });
  }, [preferences, savePreferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    saving,
    error,
    updateTradingPreferences,
    refresh: loadPreferences,
  };
}