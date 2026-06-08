"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useFinanceStore } from "@/hooks/use-finance-store"
import { exportToCSV, exportToJSON } from "@/lib/export-utils"
import { Download, Settings, BarChart3 } from "lucide-react"

export function MainHeader() {
  const { theme, setTheme } = useTheme()
  const { transactions } = useFinanceStore()
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <header
      className="max-w-7xl mx-auto max-sm:px-4 px-6 py-8 flex justify-between items-center"
      data-purpose="site-navigation"
    >
      <div className="flex items-center max-sm:gap-1 gap-2">
        <div className="max-sm:w-9 max-sm:h-9 w-10 h-10 bg-gradient-to-tr from-accent to-primary-container rounded-xl flex items-center justify-center font-black max-sm:text-lg text-xl text-on-primary-fixed shadow-lg shadow-accent/20">
          F
        </div>
        <h1 className="max-sm:hidden text-2xl font-black tracking-tight text-on-surface dark:text-white">
          Frugal<span className="text-accent">Side</span>
        </h1>
      </div>
      <div className="flex items-center max-sm:gap-1.5 gap-3">
        {transactions.length > 0 && (
          <div className="relative">
            <button
              className="max-sm:w-10 max-sm:h-10 w-12 h-12 flex items-center justify-center rounded-2xl bg-card border border-on-surface/5 dark:border-white/5 hover:border-accent/50 transition-all duration-300 shadow-sm dark:shadow-none cursor-pointer"
              aria-label="Ekspor Data"
              onClick={() => setExportOpen(!exportOpen)}
            >
              <Download className="max-sm:h-4 max-sm:w-4 h-5 w-5 text-on-surface/70" />
            </button>
            {exportOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setExportOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 bg-card border border-on-surface/5 dark:border-white/5 rounded-2xl shadow-xl overflow-hidden min-w-[180px]">
                  <button
                    className="w-full px-5 py-3 text-left text-sm font-bold text-on-surface dark:text-white hover:bg-on-surface/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => { exportToCSV(transactions); setExportOpen(false) }}
                  >
                    Ekspor CSV
                  </button>
                  <button
                    className="w-full px-5 py-3 text-left text-sm font-bold text-on-surface dark:text-white hover:bg-on-surface/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => { exportToJSON(transactions); setExportOpen(false) }}
                  >
                    Ekspor JSON
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        <Link
          href="/analytics"
          className="max-sm:w-10 max-sm:h-10 w-12 h-12 flex items-center justify-center rounded-2xl bg-card border border-on-surface/5 dark:border-white/5 hover:border-accent/50 transition-all duration-300 shadow-sm dark:shadow-none"
          aria-label="Analisis"
        >
          <BarChart3 className="max-sm:h-4 max-sm:w-4 h-5 w-5 text-on-surface/70" />
        </Link>
        <Link
          href="/settings"
          className="max-sm:w-10 max-sm:h-10 w-12 h-12 flex items-center justify-center rounded-2xl bg-card border border-on-surface/5 dark:border-white/5 hover:border-accent/50 transition-all duration-300 shadow-sm dark:shadow-none"
          aria-label="Pengaturan"
        >
          <Settings className="max-sm:h-4 max-sm:w-4 h-5 w-5 text-on-surface/70" />
        </Link>
        <button
          aria-label="Toggle Theme"
          className="max-sm:w-10 max-sm:h-10 w-12 h-12 flex items-center justify-center rounded-2xl bg-card border border-on-surface/5 dark:border-white/5 hover:border-accent/50 transition-all duration-300 shadow-sm dark:shadow-none"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? (
            <svg className="max-sm:h-5 max-sm:w-5 h-6 w-6 text-on-surface/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          ) : (
            <svg className="max-sm:h-5 max-sm:w-5 h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}
