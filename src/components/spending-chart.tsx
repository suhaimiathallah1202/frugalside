"use client"

import { useState, useMemo } from "react"
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts"
import { useTheme } from "next-themes"
import { useBudgetStore } from "@/hooks/use-budget-store"
import { BudgetModal } from "@/components/budget-modal"
import { Settings2, PieChartIcon, BarChart3, TrendingUp } from "lucide-react"
import type { Transaction } from "@/hooks/use-finance-store"

interface ChartDataItem {
  name: string
  value: number
}

interface SpendingChartProps {
  data: ChartDataItem[]
  transactions?: Transaction[]
  currentDate?: Date
}

const LIGHT_COLORS = ["#abd600", "#006a6a", "#ba1a1a", "#506600", "#a855f7", "#ec4899", "#f59e0b"]
const DARK_COLORS = ["#abd600", "#22d3ee", "#f43f5e", "#c3f400", "#a855f7", "#ec4899", "#f59e0b"]

type ChartView = "pie" | "bar" | "line"

export function SpendingChart({ data, transactions = [], currentDate }: SpendingChartProps) {
  const { theme } = useTheme()
  const { budgets, formatRupiah } = useBudgetStore()
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [chartView, setChartView] = useState<ChartView>("pie")
  const colors = theme === "light" ? LIGHT_COLORS : DARK_COLORS

  const hasBudgets = Object.keys(budgets).length > 0

  const barData = useMemo(() => {
    if (!transactions.length) return []
    const months: Record<string, { month: string; income: number; expense: number }> = {}
    for (let i = 5; i >= 0; i--) {
      const d = currentDate ? new Date(currentDate) : new Date()
      d.setMonth(d.getMonth() - i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      months[key] = { month: d.toLocaleDateString("id-ID", { month: "short" }), income: 0, expense: 0 }
    }
    for (const t of transactions) {
      const parts = t.date.split("-")
      const key = `${parts[0]}-${parts[1]}`
      if (months[key]) {
        if (t.type === "income") months[key].income += t.amount
        else months[key].expense += t.amount
      }
    }
    return Object.values(months)
  }, [transactions, currentDate])

  const lineData = useMemo(() => {
    if (!transactions.length) return []
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const map: Record<string, number> = {}
    let running = 0
    for (const t of sorted) {
      running += t.type === "income" ? t.amount : -t.amount
      map[t.date] = running
    }
    return Object.entries(map).slice(-30).map(([date, balance]) => ({
      date: new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      balance,
    }))
  }, [transactions])

  return (
    <section className="lg:col-span-7" data-purpose="spending-analysis">
      <div className="bg-card border border-on-surface/5 dark:border-white/5 max-sm:p-4 p-8 rounded-3xl h-full flex flex-col shadow-lg dark:shadow-2xl">
        <div className="flex items-center justify-between max-sm:mb-4 mb-6">
          <div className="flex items-center gap-2 bg-surface-container-low dark:bg-white/[0.03] p-1 rounded-2xl border border-on-surface/5 dark:border-white/5">
            {([
              { key: "pie", icon: PieChartIcon, label: "Distribusi" },
              { key: "bar", icon: BarChart3, label: "Tren" },
              { key: "line", icon: TrendingUp, label: "Saldo" },
            ] as const).map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                className={`flex items-center max-sm:gap-1 gap-1.5 max-sm:px-3 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  chartView === key
                    ? "bg-white dark:bg-white/10 text-on-surface dark:text-white shadow-sm"
                    : "text-on-surface/40 dark:text-white/40 hover:text-on-surface dark:hover:text-white"
                }`}
                onClick={() => setChartView(key)}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="max-sm:hidden">{label}</span>
              </button>
            ))}
          </div>
          <button
            className="flex items-center gap-1.5 text-xs font-bold text-on-surface/50 dark:text-white/50 hover:text-accent transition-colors cursor-pointer max-sm:px-2 px-3 py-2 rounded-xl hover:bg-on-surface/5 dark:hover:bg-white/5"
            onClick={() => setBudgetModalOpen(true)}
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span className="max-sm:hidden">{hasBudgets ? "Ubah Budget" : "Atur Budget"}</span>
          </button>
        </div>

        <div className="flex-grow flex flex-col" style={{ minHeight: 350 }}>
          {chartView === "pie" && (
            data.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                      {data.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === "light" ? "#ffffff" : "#161618",
                        borderColor: theme === "light" ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.05)",
                        borderRadius: "1rem",
                        color: theme === "light" ? "#1B1C1C" : "#fff",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span className="text-sm text-on-surface/80 dark:text-slate-300">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {hasBudgets && (
                  <div className="mt-4 space-y-3 px-2">
                    <p className="text-xs font-black text-on-surface/30 dark:text-white/30 uppercase tracking-widest">Budget vs Realisasi</p>
                    {data.filter((d) => budgets[d.name]).map((d) => {
                      const limit = budgets[d.name]
                      const pct = Math.min((d.value / limit) * 100, 100)
                      const over = d.value > limit
                      return (
                        <div key={d.name} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-on-surface/70 dark:text-white/70">{d.name}</span>
                            <span className={over ? "text-danger font-bold" : "text-on-surface/50 dark:text-white/50"}>
                              {formatRupiah(d.value)} / {formatRupiah(limit)}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-surface-container-low dark:bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${over ? "bg-danger" : "bg-accent"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center text-4xl">📊</div>
                <h3 className="text-xl font-black text-on-surface dark:text-white mb-3">Grafik Akan Muncul di Sini</h3>
                <p className="text-on-surface/50 dark:text-white/50 max-w-xs mx-auto leading-relaxed text-sm">
                  Setelah mencatat transaksi pertama, grafik akan menampilkan distribusi pengeluaranmu secara otomatis.
                </p>
                <button
                  className="mt-8 text-sm font-bold text-accent hover:text-accent/80 transition-colors cursor-pointer inline-flex items-center gap-1 group"
                  onClick={() => document.querySelector('[data-purpose="transaction-input"]')?.scrollIntoView({ behavior: "smooth" })}
                >
                  Mulai Catat Sekarang
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            )
          )}

          {chartView === "bar" && (
            barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === "light" ? "#e4e2e2" : "rgba(255,255,255,0.05)"} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: theme === "light" ? "#5d5f5f" : "#b7b5b4" }} />
                  <YAxis tick={{ fontSize: 12, fill: theme === "light" ? "#5d5f5f" : "#b7b5b4" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: theme === "light" ? "#ffffff" : "#161618", borderColor: "rgba(0,0,0,0.05)", borderRadius: "1rem", color: theme === "light" ? "#1B1C1C" : "#fff" }}
                  />
                  <Legend
                    formatter={(value) => <span className="text-sm text-on-surface/80 dark:text-slate-300">{value === "income" ? "Pemasukan" : value === "expense" ? "Pengeluaran" : value}</span>}
                  />
                  <Bar dataKey="income" fill="#006a6a" radius={[8, 8, 0, 0]} name="income" />
                  <Bar dataKey="expense" fill="#ba1a1a" radius={[8, 8, 0, 0]} name="expense" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-4xl">📈</div>
                <h3 className="text-xl font-black text-on-surface dark:text-white mb-3">Tren Bulanan</h3>
                <p className="text-on-surface/50 dark:text-white/50 max-w-xs mx-auto leading-relaxed text-sm">
                  Data tren akan muncul setelah kamu memiliki beberapa bulan transaksi.
                </p>
              </div>
            )
          )}

          {chartView === "line" && (
            lineData.length > 1 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === "light" ? "#e4e2e2" : "rgba(255,255,255,0.05)"} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: theme === "light" ? "#5d5f5f" : "#b7b5b4" }} />
                  <YAxis tick={{ fontSize: 12, fill: theme === "light" ? "#5d5f5f" : "#b7b5b4" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: theme === "light" ? "#ffffff" : "#161618", borderColor: "rgba(0,0,0,0.05)", borderRadius: "1rem", color: theme === "light" ? "#1B1C1C" : "#fff" }}
                  />
                  <Line type="monotone" dataKey="balance" stroke="#abd600" strokeWidth={3} dot={{ fill: "#abd600", r: 4 }} name="Saldo" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-4xl">📉</div>
                <h3 className="text-xl font-black text-on-surface dark:text-white mb-3">Perubahan Saldo</h3>
                <p className="text-on-surface/50 dark:text-white/50 max-w-xs mx-auto leading-relaxed text-sm">
                  Grafik saldo akan muncul setelah kamu memiliki beberapa transaksi.
                </p>
              </div>
            )
          )}
        </div>
      </div>

      <BudgetModal open={budgetModalOpen} onOpenChange={setBudgetModalOpen} />
    </section>
  )
}
