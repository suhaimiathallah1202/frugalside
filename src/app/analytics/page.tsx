"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useFinanceStore } from "@/hooks/use-finance-store"
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Target, Zap } from "lucide-react"
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts"
import { useTheme } from "next-themes"

const LIGHT_COLORS = ["#abd600", "#006a6a", "#ba1a1a", "#506600", "#a855f7", "#ec4899", "#f59e0b", "#06b6d4", "#84cc16"]
const DARK_COLORS = ["#abd600", "#22d3ee", "#f43f5e", "#c3f400", "#a855f7", "#ec4899", "#f59e0b", "#06b6d4", "#84cc16"]

export default function AnalyticsPage() {
  const { transactions, formatRupiah } = useFinanceStore()
  const { theme } = useTheme()
  const colors = theme === "dark" ? DARK_COLORS : LIGHT_COLORS

  const years = useMemo(() => {
    const y = new Set<number>()
    for (const t of transactions) {
      const year = new Date(t.date).getFullYear()
      y.add(year)
    }
    return Array.from(y).sort()
  }, [transactions])

  const [selectedYear, setSelectedYear] = useState(() => {
    const now = new Date().getFullYear()
    return years.includes(now) ? now : (years[years.length - 1] || now)
  })

  useEffect(() => {
    if (years.length > 0 && !years.includes(selectedYear)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedYear(years[years.length - 1])
    }
  }, [years, selectedYear])

  const yearTransactions = useMemo(
    () => transactions.filter((t) => new Date(t.date).getFullYear() === selectedYear),
    [transactions, selectedYear]
  )

  const totalIncome = useMemo(
    () => yearTransactions.filter((t) => t.type === "income").reduce((a, t) => a + t.amount, 0),
    [yearTransactions]
  )

  const totalExpense = useMemo(
    () => yearTransactions.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0),
    [yearTransactions]
  )

  const net = totalIncome - totalExpense

  const avgMonthlyExpense = useMemo(() => {
    const months = new Set(yearTransactions.map((t) => t.date.slice(0, 7)))
    return months.size > 0 ? totalExpense / months.size : 0
  }, [yearTransactions, totalExpense])

  const biggestExpense = useMemo(() => {
    const expenses = yearTransactions.filter((t) => t.type === "expense")
    if (expenses.length === 0) return null
    return expenses.reduce((a, b) => (a.amount > b.amount ? a : b))
  }, [yearTransactions])

  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of yearTransactions.filter((t) => t.type === "expense")) {
      map.set(t.category, (map.get(t.category) || 0) + t.amount)
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [yearTransactions])

  const topCategory = categoryTotals[0]?.name || "-"

  const monthlyTrend = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>()
    for (let m = 0; m < 12; m++) {
      const key = `${selectedYear}-${String(m + 1).padStart(2, "0")}`
      map.set(key, { income: 0, expense: 0 })
    }
    for (const t of yearTransactions) {
      const key = t.date.slice(0, 7)
      if (map.has(key)) {
        const entry = map.get(key)!
        if (t.type === "income") entry.income += t.amount
        else entry.expense += t.amount
      }
    }
    return Array.from(map.entries()).map(([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString("id-ID", { month: "short" }),
      income: data.income,
      expense: data.expense,
    }))
  }, [yearTransactions, selectedYear])

  const topExpenses = useMemo(
    () => yearTransactions.filter((t) => t.type === "expense").sort((a, b) => b.amount - a.amount).slice(0, 10),
    [yearTransactions]
  )

  return (
    <main className="max-w-4xl mx-auto max-sm:px-4 px-6 py-8 max-sm:space-y-6 space-y-8">
      <div className="flex items-center max-sm:gap-2 gap-4">
        <Link
          href="/"
          className="max-sm:w-9 max-sm:h-9 w-10 h-10 flex items-center justify-center rounded-2xl bg-card border border-on-surface/5 dark:border-white/5 hover:border-accent/50 transition-all"
        >
          <ArrowLeft className="max-sm:h-4 max-sm:w-4 h-5 w-5 text-on-surface/70" />
        </Link>
        <h1 className="max-sm:text-lg text-2xl font-black tracking-tight text-on-surface dark:text-white flex-1">
          Analisis Keuangan
        </h1>
        <select
          className="bg-card border border-on-surface/5 dark:border-white/5 rounded-2xl max-sm:px-3 max-sm:py-1.5 px-4 py-2 text-sm font-bold text-on-surface dark:text-white outline-none cursor-pointer"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-card rounded-3xl flex items-center justify-center mb-4 text-4xl">
            📊
          </div>
          <h2 className="text-xl font-black text-on-surface dark:text-white mb-2">Belum Ada Data</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Catat transaksi dulu yuk, biar kamu bisa lihat analisis keuangan di sini!
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 max-sm:gap-3 gap-4">
            <div className="bg-card rounded-3xl max-sm:p-4 p-5 shadow-sm ring-1 ring-foreground/5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pemasukan</span>
              </div>
              <p className="max-sm:text-lg text-xl font-black text-success">{formatRupiah(totalIncome)}</p>
            </div>
            <div className="bg-card rounded-3xl max-sm:p-4 p-5 shadow-sm ring-1 ring-foreground/5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-danger" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pengeluaran</span>
              </div>
              <p className="max-sm:text-lg text-xl font-black text-danger">{formatRupiah(totalExpense)}</p>
            </div>
            <div className="bg-card rounded-3xl max-sm:p-4 p-5 shadow-sm ring-1 ring-foreground/5">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-accent" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Net</span>
              </div>
              <p className={`max-sm:text-lg text-xl font-black ${net >= 0 ? "text-success" : "text-danger"}`}>
                {net >= 0 ? "+" : ""}{formatRupiah(net)}
              </p>
            </div>
            <div className="bg-card rounded-3xl max-sm:p-4 p-5 shadow-sm ring-1 ring-foreground/5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Rata-rata/Bulan</span>
              </div>
              <p className="max-sm:text-lg text-xl font-black text-amber-500">{formatRupiah(Math.round(avgMonthlyExpense))}</p>
            </div>
            <div className="bg-card rounded-3xl max-sm:p-4 p-5 shadow-sm ring-1 ring-foreground/5">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Kategori Teratas</span>
              </div>
              <p className="max-sm:text-lg text-xl font-black text-purple-500 truncate">{topCategory}</p>
            </div>
            <div className="bg-card rounded-3xl max-sm:p-4 p-5 shadow-sm ring-1 ring-foreground/5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-rose-500" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pengeluaran Tertinggi</span>
              </div>
              <p className="max-sm:text-lg text-xl font-black text-rose-500 truncate">
                {biggestExpense ? formatRupiah(biggestExpense.amount) : "-"}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          <section className="bg-card rounded-3xl max-sm:p-4 p-6 md:p-8 shadow-sm ring-1 ring-foreground/5 max-sm:space-y-3 space-y-4">
            <h2 className="text-lg font-bold text-on-surface dark:text-white">Pengeluaran per Kategori</h2>
            {categoryTotals.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryTotals} layout="vertical" margin={{ left: 80, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-on-surface/10 dark:text-white/10" />
                    <XAxis type="number" tick={{ fontSize: 12 }} className="text-on-surface/50 dark:text-white/50" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} className="text-on-surface/50 dark:text-white/50" width={80} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "1rem",
                        fontSize: "13px",
                      }}
                      formatter={(value) => formatRupiah(Number(value))}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {categoryTotals.map((_, i) => (
                        <Cell key={i} fill={colors[i % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Tidak ada pengeluaran tahun ini.</p>
            )}
          </section>

          {/* Monthly Trend */}
          <section className="bg-card rounded-3xl max-sm:p-4 p-6 md:p-8 shadow-sm ring-1 ring-foreground/5 max-sm:space-y-3 space-y-4">
            <h2 className="text-lg font-bold text-on-surface dark:text-white">Tren Bulanan</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-on-surface/10 dark:text-white/10" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-on-surface/50 dark:text-white/50" />
                  <YAxis tick={{ fontSize: 12 }} className="text-on-surface/50 dark:text-white/50" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "1rem",
                      fontSize: "13px",
                    }}
                    formatter={(value) => formatRupiah(Number(value))}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} name="Pemasukan" />
                  <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} name="Pengeluaran" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Top Expenses */}
          {topExpenses.length > 0 && (
            <section className="bg-card rounded-3xl max-sm:p-4 p-6 md:p-8 shadow-sm ring-1 ring-foreground/5 max-sm:space-y-3 space-y-4">
              <h2 className="text-lg font-bold text-on-surface dark:text-white">10 Pengeluaran Terbesar</h2>
              <div className="space-y-2">
                {topExpenses.map((t, i) => (
                  <div
                    key={t.id}
                      className="flex items-center justify-between max-sm:px-3 max-sm:py-2.5 px-4 py-3 rounded-2xl bg-surface-container-low dark:bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-danger/10 text-danger text-xs font-black flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-on-surface dark:text-white truncate">{t.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          {t.description && <> &middot; {t.description}</>}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 ml-3 font-black text-sm text-danger">
                      - {formatRupiah(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  )
}
