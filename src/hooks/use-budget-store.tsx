"use client";

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useSettings } from './use-settings-store';

export type BudgetMap = Record<string, number>;

type BudgetStore = {
  budgets: BudgetMap;
  isHydrated: boolean;
  setBudget: (category: string, limit: number) => void;
  removeBudget: (category: string) => void;
  getSpending: (category: string, month: string) => number;
  formatRupiah: (amount: number) => string;
};

const BudgetContext = createContext<BudgetStore | null>(null);

const STORAGE_KEY = 'duitku-budgets-v1';

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = useState<BudgetMap>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const { formatCurrency } = useSettings();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBudgets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse budgets', e);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
    }
  }, [budgets, isHydrated]);

  const setBudget = useCallback((category: string, limit: number) => {
    setBudgets((prev) => {
      const next = { ...prev };
      if (limit > 0) {
        next[category] = limit;
      } else {
        delete next[category];
      }
      return next;
    });
  }, []);

  const removeBudget = useCallback((category: string) => {
    setBudgets((prev) => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
  }, []);

  const formatRupiah = useCallback((amount: number) => {
    return formatCurrency(amount);
  }, [formatCurrency]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getSpending = useCallback((_category: string, _month: string) => {
    return 0;
  }, []);

  const value = useMemo(
    () => ({ budgets, isHydrated, setBudget, removeBudget, getSpending, formatRupiah }),
    [budgets, isHydrated, setBudget, removeBudget, getSpending, formatRupiah]
  );

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudgetStore(): BudgetStore {
  const ctx = useContext(BudgetContext);
  if (!ctx) {
    throw new Error('useBudgetStore must be used within a BudgetProvider');
  }
  return ctx;
}
