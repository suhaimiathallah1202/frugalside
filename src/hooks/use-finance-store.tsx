"use client";

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useSettings } from './use-settings-store';

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description?: string;
};

type FinanceStore = {
  transactions: Transaction[];
  isHydrated: boolean;
  addTransaction: (data: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, data: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  getSummary: () => { totalIncome: number; totalExpense: number };
  getBalance: () => number;
  formatRupiah: (amount: number) => string;
};

const FinanceContext = createContext<FinanceStore | null>(null);

const STORAGE_KEY = 'duitku-v1';

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { formatCurrency } = useSettings();

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setTransactions(parsed);
        }
      } catch (e) {
        console.error('Failed to parse transactions from localStorage', e);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions, isHydrated]);

  const addTransaction = useCallback((data: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...data,
      id: typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 11),
    };
    setTransactions((prev) => [...prev, newTransaction]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateTransaction = useCallback((id: string, data: Omit<Transaction, 'id'>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
  }, []);

  const getSummary = useCallback(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === 'income') {
          acc.totalIncome += t.amount;
        } else {
          acc.totalExpense += t.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );
  }, [transactions]);

  const getBalance = useCallback(() => {
    const { totalIncome, totalExpense } = getSummary();
    return totalIncome - totalExpense;
  }, [getSummary]);

  const formatRupiah = useCallback((amount: number) => {
    return formatCurrency(amount);
  }, [formatCurrency]);

  const value = useMemo(
    () => ({
      transactions,
      isHydrated,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getSummary,
      getBalance,
      formatRupiah,
    }),
    [transactions, isHydrated, addTransaction, updateTransaction, deleteTransaction, getSummary, getBalance, formatRupiah]
  );

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinanceStore(): FinanceStore {
  const ctx = useContext(FinanceContext);
  if (!ctx) {
    throw new Error('useFinanceStore must be used within a FinanceProvider');
  }
  return ctx;
}
