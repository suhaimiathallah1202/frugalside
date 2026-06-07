"use client";

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export type Frequency = "weekly" | "monthly";

export type RecurringConfig = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  frequency: Frequency;
  lastApplied: string;
  enabled: boolean;
};

type RecurringStore = {
  recurring: RecurringConfig[];
  isHydrated: boolean;
  addRecurring: (config: Omit<RecurringConfig, 'id' | 'lastApplied'>) => void;
  updateRecurring: (id: string, data: Partial<RecurringConfig>) => void;
  removeRecurring: (id: string) => void;
  getDueTransactions: () => (Omit<RecurringConfig, 'lastApplied' | 'enabled'>)[];
  markApplied: (id: string) => void;
};

const RecurringContext = createContext<RecurringStore | null>(null);

const STORAGE_KEY = 'duitku-recurring-v1';

export function RecurringProvider({ children }: { children: React.ReactNode }) {
  const [recurring, setRecurring] = useState<RecurringConfig[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRecurring(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recurring configs', e);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recurring));
    }
  }, [recurring, isHydrated]);

  const addRecurring = useCallback((config: Omit<RecurringConfig, 'id' | 'lastApplied'>) => {
    const newConfig: RecurringConfig = {
      ...config,
      id: typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 11),
      lastApplied: new Date().toISOString().split('T')[0],
    };
    setRecurring((prev) => [...prev, newConfig]);
  }, []);

  const updateRecurring = useCallback((id: string, data: Partial<RecurringConfig>) => {
    setRecurring((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
  }, []);

  const removeRecurring = useCallback((id: string) => {
    setRecurring((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const getDueTransactions = useCallback(() => {
    const today = new Date();
    return recurring
      .filter((r) => r.enabled)
      .filter((r) => {
        const last = new Date(r.lastApplied);
        if (r.frequency === "weekly") {
          const daysSince = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
          return daysSince >= 7;
        }
        if (r.frequency === "monthly") {
          return today.getMonth() !== last.getMonth() || today.getFullYear() !== last.getFullYear();
        }
        return false;
      })
      .map(({ lastApplied, enabled, ...rest }) => rest);
  }, [recurring]);

  const markApplied = useCallback((id: string) => {
    setRecurring((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, lastApplied: new Date().toISOString().split('T')[0] } : r
      )
    );
  }, []);

  const value = useMemo(
    () => ({ recurring, isHydrated, addRecurring, updateRecurring, removeRecurring, getDueTransactions, markApplied }),
    [recurring, isHydrated, addRecurring, updateRecurring, removeRecurring, getDueTransactions, markApplied]
  );

  return (
    <RecurringContext.Provider value={value}>
      {children}
    </RecurringContext.Provider>
  );
}

export function useRecurringStore(): RecurringStore {
  const ctx = useContext(RecurringContext);
  if (!ctx) {
    throw new Error('useRecurringStore must be used within a RecurringProvider');
  }
  return ctx;
}
