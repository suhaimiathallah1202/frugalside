"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useFinanceStore } from "@/hooks/use-finance-store"
import { useBudgetStore } from "@/hooks/use-budget-store"
import { useRecurringStore } from "@/hooks/use-recurring-store"
import { MainHeader } from "@/components/main-header"
import { QuickStats } from "@/components/quick-stats"
import { TransactionForm } from "@/components/transaction-form"
import { SpendingChart } from "@/components/spending-chart"
import { TransactionHistory } from "@/components/transaction-history"
import { FloatingActionButton } from "@/components/floating-action-button"
import { Skeleton } from "@/components/skeleton"

export default function Dashboard() {
  const { transactions, formatRupiah, isHydrated, addTransaction } = useFinanceStore()
  const { budgets } = useBudgetStore()
  const { getDueTransactions, markApplied } = useRecurringStore()

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

  const spendStatus = useMemo(() => {
    if (balance > 500000) {
      return { label: "Safe to spend", color: "bg-white/20 text-white/90", dotColor: "bg-white" }
    }
    if (balance > 0) {
      return { label: "Hemat-hemat", color: "bg-amber-500/30 text-amber-100", dotColor: "bg-amber-300" }
    }
    return { label: "Hati-hati", color: "bg-red-500/30 text-red-100", dotColor: "bg-red-300" }
  }, [balance])

  const budgetInfo = useMemo(() => {
    const totalBudget = Object.values(budgets).reduce((acc, v) => acc + v, 0)
    const categoryBudgets = Object.keys(budgets)
    const totalSpent = monthlyTransactions
      .filter((t) => t.type === "expense" && categoryBudgets.includes(t.category))
      .reduce((acc, t) => acc + t.amount, 0)
    return { totalBudget, totalSpent, remaining: totalBudget - totalSpent, formatRupiah }
  }, [budgets, monthlyTransactions, formatRupiah])

  useEffect(() => {
    if (!isHydrated) return
    const due = getDueTransactions()
    for (const item of due) {
      addTransaction({
        type: item.type,
        amount: item.amount,
        category: item.category,
        description: item.description,
        date: new Date().toISOString().split("T")[0],
      })
      markApplied(item.id)
    }
  }, [isHydrated, getDueTransactions, addTransaction, markApplied])

  if (!isHydrated) {
    return (
      <div className="min-h-screen pb-20 transition-colors duration-300 bg-dark text-on-surface dark:text-white">
        <div className="max-w-7xl mx-auto max-sm:px-4 px-6 py-8">
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

      <main className="max-w-7xl mx-auto max-sm:px-4 px-6 max-sm:space-y-6 space-y-8">
        {transactions.length === 0 && (
          <div className="bg-gradient-to-br from-accent/10 to-primary-fixed/5 border border-accent/20 rounded-3xl max-sm:p-5 p-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">👋</span>
                <h2 className="text-2xl font-black text-on-surface dark:text-white">
                  Selamat Datang di FrugalSide
                </h2>
              </div>
              <p className="text-on-surface/60 dark:text-white/60 mb-6 max-w-2xl">
                Kelola keuanganmu dengan mudah dan menyenangkan. Ikuti 3 langkah sederhana ini untuk memulai:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { step: "1", icon: "✏️", title: "Catat Pengeluaran", desc: "Catat setiap pengeluaran harianmu" },
                  { step: "2", icon: "💵", title: "Tambah Pemasukan", desc: "Catat semua sumber pendapatan" },
                  { step: "3", icon: "📈", title: "Pantau Grafik", desc: "Lihat distribusi pengeluaranmu" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3 bg-black/5 dark:bg-white/5 rounded-2xl p-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-accent text-on-primary-fixed rounded-full flex items-center justify-center text-sm font-black">
                      {item.step}
                    </span>
                    <div>
                      <p className="font-bold text-sm text-on-surface dark:text-white">
                        {item.icon} {item.title}
                      </p>
                      <p className="text-xs text-on-surface/50 dark:text-white/50 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="bg-accent text-on-primary-fixed font-black py-3 px-6 rounded-2xl hover:brightness-105 dark:hover:brightness-110 transition-all duration-300 transform active:scale-95 shadow-lg hover:shadow-accent/40 cursor-pointer inline-flex items-center gap-2 group text-sm"
                onClick={() => {
                  document.querySelector('[data-purpose="transaction-input"]')?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Mulai Sekarang
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        )}

        {/* Month Navigation */}
        <div className="flex items-center justify-center max-sm:gap-2 gap-4" data-purpose="month-navigation">
          <button
            className="max-sm:w-9 max-sm:h-9 w-10 h-10 flex items-center justify-center rounded-xl bg-card border border-on-surface/5 dark:border-white/5 hover:border-accent/50 transition-all cursor-pointer"
            onClick={goPrevMonth}
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="max-sm:h-4 max-sm:w-4 h-5 w-5 text-on-surface/70" />
          </button>
          <h2 className="max-sm:text-sm text-lg font-bold text-on-surface dark:text-white max-sm:min-w-0 min-w-[200px] text-center max-sm:truncate">
            {monthLabel}
          </h2>
          <button
            className={`max-sm:w-9 max-sm:h-9 w-10 h-10 flex items-center justify-center rounded-xl bg-card border border-on-surface/5 dark:border-white/5 hover:border-accent/50 transition-all cursor-pointer ${
              !canGoNext ? "opacity-30 cursor-not-allowed" : ""
            }`}
            onClick={canGoNext ? goNextMonth : undefined}
            aria-label="Bulan berikutnya"
            disabled={!canGoNext}
          >
            <ChevronRight className="max-sm:h-4 max-sm:w-4 h-5 w-5 text-on-surface/70" />
          </button>
        </div>

        <QuickStats
          balance={formatRupiah(balance)}
          monthlyIncome={formatRupiah(monthlyIncome)}
          monthlyExpense={formatRupiah(monthlyExpense)}
          budgetInfo={budgetInfo}
          spendStatus={spendStatus}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <TransactionForm selectedMonth={currentDate} />
          <SpendingChart data={chartData} transactions={transactions} currentDate={currentDate} />
        </div>

        <TransactionHistory transactions={monthlyTransactions} />
      </main>

      <FloatingActionButton />
    </div>
  )
}
