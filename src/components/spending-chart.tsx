"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { useTheme } from "next-themes"

interface ChartDataItem {
  name: string
  value: number
}

interface SpendingChartProps {
  data: ChartDataItem[]
}

const LIGHT_COLORS = ["#abd600", "#006a6a", "#ba1a1a", "#506600", "#a855f7", "#ec4899", "#f59e0b"]
const DARK_COLORS = ["#abd600", "#22d3ee", "#f43f5e", "#c3f400", "#a855f7", "#ec4899", "#f59e0b"]

export function SpendingChart({ data }: SpendingChartProps) {
  const { theme } = useTheme()
  const colors = theme === "light" ? LIGHT_COLORS : DARK_COLORS

  return (
    <section className="lg:col-span-7" data-purpose="spending-analysis">
      <div className="bg-card border border-on-surface/5 dark:border-white/5 p-8 rounded-3xl h-full flex flex-col shadow-lg dark:shadow-2xl">
        <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-on-surface dark:text-white">
          <span className="w-1.5 h-6 bg-success rounded-full" />
          Distribusi Pengeluaran
        </h3>
        <div className="flex-grow flex flex-col" style={{ minHeight: 350 }}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
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
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-on-surface/10 dark:border-white/5 rounded-3xl p-12 text-center group hover:border-accent/30 transition-all">
              <div className="w-24 h-24 mb-6 rounded-full bg-surface-container-low dark:bg-white/5 flex items-center justify-center text-on-surface/20 dark:text-white/20 group-hover:text-accent transition-colors">
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  <path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                </svg>
              </div>
              <p className="text-on-surface/40 dark:text-white/40 font-medium italic">
                &ldquo;Belum ada data pengeluaran untuk dianalisis.&rdquo;
              </p>
              <p className="text-xs text-on-surface/30 dark:text-white/20 mt-2">
                Mulai catat transaksi pertamamu sekarang!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
