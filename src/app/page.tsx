"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useFinanceStore } from "@/hooks/use-finance-store"
import { MainHeader } from "@/components/main-header"
import { QuickStats } from "@/components/quick-stats"
import { TransactionForm } from "@/components/transaction-form"
import { SpendingChart } from "@/components/spending-chart"
import { TransactionHistory } from "@/components/transaction-history"
import { FloatingActionButton } from "@/components/floating-action-button"
import { Skeleton } from "@/components/skeleton"

export default function Dashboard() {
  const { transactions, formatRupiah, isHydrated } = useFinanceStore()

  const [currentDate, setCurrentDate] = useState(() => new Date())

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const monthLabel = currentDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })

  const goPrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const canGoNext = useMemo(() => {
    const now = new Date()
    return currentMonth < now.getMonth() || currentYear < now.getFullYear()
  }, [currentMonth, currentYear])

  const monthlyTransactions = useMemo(
    () =>
      transactions.filter((t) => {
        const [y, m] = t.date.split("-").map(Number)
        return m - 1 === currentMonth && y === currentYear
      }),
    [transactions, currentMonth, currentYear]
  )

  const monthlyIncome = useMemo(
    () =>
      monthlyTransactions
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + t.amount, 0),
    [monthlyTransactions]
  )

  const monthlyExpense = useMemo(
    () =>
      monthlyTransactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + t.amount, 0),
    [monthlyTransactions]
  )

  const chartData = useMemo(
    () =>
      monthlyTransactions
        .filter((t) => t.type === "expense")
        .reduce<{ name: string; value: number }[]>((acc, t) => {
          const existing = acc.find((item) => item.name === t.category)
          if (existing) {
            existing.value += t.amount
          } else {
            acc.push({ name: t.category, value: t.amount })
          }
          return acc
        }, []),
    [monthlyTransactions]
  )

  const balance = useMemo(
    () =>
      transactions.reduce((acc, t) => {
        return t.type === "income" ? acc + t.amount : acc - t.amount
      }, 0),
    [transactions]
  )

  if (!isHydrated) {
    return (
      <div className="min-h-screen pb-20 transition-colors duration-300 bg-dark text-on-surface dark:text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-12 w-12 rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-44 rounded-3xl" />
            <Skeleton className="h-44 rounded-3xl" />
            <Skeleton className="h-44 rounded-3xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark text-on-surface dark:text-white font-sans selection:bg-accent selection:text-black min-h-screen pb-20 transition-colors duration-300">
      <MainHeader />

      <main className="max-w-7xl mx-auto px-6 space-y-8">
        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-4" data-purpose="month-navigation">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-card border border-on-surface/5 dark:border-white/5 hover:border-accent/50 transition-all cursor-pointer"
            onClick={goPrevMonth}
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="h-5 w-5 text-on-surface/70" />
          </button>
          <h2 className="text-lg font-bold text-on-surface dark:text-white min-w-[200px] text-center">
            {monthLabel}
          </h2>
          <button
            className={`w-10 h-10 flex items-center justify-center rounded-xl bg-card border border-on-surface/5 dark:border-white/5 hover:border-accent/50 transition-all cursor-pointer ${
              !canGoNext ? "opacity-30 cursor-not-allowed" : ""
            }`}
            onClick={canGoNext ? goNextMonth : undefined}
            aria-label="Bulan berikutnya"
            disabled={!canGoNext}
          >
            <ChevronRight className="h-5 w-5 text-on-surface/70" />
          </button>
        </div>

        <QuickStats
          balance={formatRupiah(balance)}
          monthlyIncome={formatRupiah(monthlyIncome)}
          monthlyExpense={formatRupiah(monthlyExpense)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <TransactionForm selectedMonth={currentDate} />
          <SpendingChart data={chartData} />
        </div>

        <TransactionHistory transactions={monthlyTransactions} />
      </main>

      <FloatingActionButton />
    </div>
  )
}
