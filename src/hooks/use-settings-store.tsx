"use client";

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'SGD' | 'MYR';
export type ExportFormat = 'csv' | 'json';

export const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; locale: string }> = {
  IDR: { symbol: 'Rp', locale: 'id-ID' },
  USD: { symbol: '$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' },
  JPY: { symbol: '¥', locale: 'ja-JP' },
  SGD: { symbol: 'S$', locale: 'en-SG' },
  MYR: { symbol: 'RM', locale: 'ms-MY' },
};

type Settings = {
  currency: CurrencyCode;
  exportFormat: ExportFormat;
};

type SettingsContextType = {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
  formatCurrency: (amount: number) => string;
  resetData: () => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

const STORAGE_KEY = 'duitku-settings-v1';

const DEFAULT_SETTINGS: Settings = {
  currency: 'IDR',
  exportFormat: 'csv',
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, isHydrated]);

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    const cfg = CURRENCY_CONFIG[settings.currency];
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 0,
    }).format(amount);
  }, [settings.currency]);

  const resetData = useCallback(() => {
    localStorage.removeItem('duitku-v1');
    localStorage.removeItem('duitku-budgets-v1');
    localStorage.removeItem('duitku-recurring-v1');
    window.location.reload();
  }, []);

  const value = useMemo(
    () => ({ settings, updateSettings, formatCurrency, resetData }),
    [settings, updateSettings, formatCurrency, resetData]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}
