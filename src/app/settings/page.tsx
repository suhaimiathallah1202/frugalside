"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useSettings, CURRENCY_CONFIG, type CurrencyCode } from "@/hooks/use-settings-store"
import { useFinanceStore } from "@/hooks/use-finance-store"
import { ArrowLeft, Sun, Moon, Monitor, Trash2, Check } from "lucide-react"

const CURRENCIES: { code: CurrencyCode; label: string }[] = [
  { code: "IDR", label: "IDR - Rupiah (Rp)" },
  { code: "USD", label: "USD - Dollar ($)" },
  { code: "EUR", label: "EUR - Euro (€)" },
  { code: "GBP", label: "GBP - Pound (£)" },
  { code: "JPY", label: "JPY - Yen (¥)" },
  { code: "SGD", label: "SGD - Dollar Singapore (S$)" },
  { code: "MYR", label: "MYR - Ringgit (RM)" },
]

export default function SettingsPage() {
  const { settings, updateSettings, resetData } = useSettings()
  const { theme, setTheme } = useTheme()
  const { transactions } = useFinanceStore()
  const [confirmReset, setConfirmReset] = useState(false)
  const [copied, setCopied] = useState(false)

  const currentTheme = theme === "system" ? "system" : theme === "dark" ? "dark" : "light"

  return (
    <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-card border border-on-surface/5 dark:border-white/5 hover:border-accent/50 transition-all"
        >
          <ArrowLeft className="h-5 w-5 text-on-surface/70" />
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-on-surface dark:text-white">
          Pengaturan
        </h1>
      </div>

      {/* Currency */}
      <section className="bg-card rounded-3xl p-6 md:p-8 shadow-sm ring-1 ring-foreground/5 space-y-4">
        <h2 className="text-lg font-bold text-on-surface dark:text-white">Mata Uang</h2>
        <p className="text-sm text-muted-foreground">Pilih mata uang yang digunakan untuk menampilkan seluruh nominal.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => updateSettings({ currency: c.code })}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold text-left transition-all cursor-pointer ${
                settings.currency === c.code
                  ? "border-accent bg-accent/10 text-accent-foreground dark:text-white"
                  : "border-border text-on-surface dark:text-white hover:border-on-surface/20"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                settings.currency === c.code ? "border-accent bg-accent" : "border-muted-foreground/30"
              }`}>
                {settings.currency === c.code && <Check className="w-3 h-3 text-accent-foreground dark:text-white" />}
              </span>
              {c.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          Contoh: {settings.currency === 'IDR' ? 'Rp' : CURRENCY_CONFIG[settings.currency].symbol}1.000
        </p>
      </section>

      {/* Theme */}
      <section className="bg-card rounded-3xl p-6 md:p-8 shadow-sm ring-1 ring-foreground/5 space-y-4">
        <h2 className="text-lg font-bold text-on-surface dark:text-white">Tampilan</h2>
        <p className="text-sm text-muted-foreground">Atur tema tampilan sesuai preferensimu.</p>
        <div className="flex gap-3">
          {[
            { value: "light", label: "Terang", icon: Sun },
            { value: "dark", label: "Gelap", icon: Moon },
            { value: "system", label: "Sistem", icon: Monitor },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex-1 flex flex-col items-center gap-2 px-4 py-4 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${
                currentTheme === value
                  ? "border-accent bg-accent/10 text-accent-foreground dark:text-white"
                  : "border-border text-on-surface dark:text-white hover:border-on-surface/20"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Export Format */}
      <section className="bg-card rounded-3xl p-6 md:p-8 shadow-sm ring-1 ring-foreground/5 space-y-4">
        <h2 className="text-lg font-bold text-on-surface dark:text-white">Format Ekspor</h2>
        <p className="text-sm text-muted-foreground">Pilih format default saat mengekspor data transaksi.</p>
        <div className="flex gap-3">
          {[
            { value: "csv" as const, label: "CSV" },
            { value: "json" as const, label: "JSON" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateSettings({ exportFormat: opt.value })}
              className={`flex-1 px-4 py-3 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${
                settings.exportFormat === opt.value
                  ? "border-accent bg-accent/10 text-accent-foreground dark:text-white"
                  : "border-border text-on-surface dark:text-white hover:border-on-surface/20"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Reset Data */}
      <section className="bg-card rounded-3xl p-6 md:p-8 shadow-sm ring-1 ring-foreground/5 space-y-4">
        <h2 className="text-lg font-bold text-danger">Reset Data</h2>
        <p className="text-sm text-muted-foreground">
          Hapus semua data transaksi, budget, dan pengaturan berulang. Tindakan ini tidak dapat dibatalkan.
        </p>
        {confirmReset ? (
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmReset(false)}
              className="flex-1 px-4 py-3 rounded-2xl border border-border text-on-surface dark:text-white font-semibold hover:bg-muted transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={resetData}
              className="flex-1 px-4 py-3 rounded-2xl bg-danger text-white font-bold hover:brightness-110 transition-all cursor-pointer"
            >
              Ya, Reset Semua
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-danger/30 text-danger font-semibold hover:bg-danger/5 transition-all cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Hapus Semua Data ({transactions.length} transaksi)
          </button>
        )}
      </section>

      {/* About */}
      <section className="bg-card rounded-3xl p-6 md:p-8 shadow-sm ring-1 ring-foreground/5 space-y-2 text-center">
        <div className="w-12 h-12 mx-auto bg-gradient-to-tr from-accent to-primary-container rounded-xl flex items-center justify-center font-black text-xl text-on-primary-fixed shadow-lg shadow-accent/20">
          F
        </div>
        <h2 className="text-lg font-bold text-on-surface dark:text-white">FrugalSide</h2>
        <p className="text-sm text-muted-foreground">Versi 1.0.0</p>
        <p className="text-xs text-muted-foreground">
          Aplikasi pencatatan keuangan untuk Gen Z.
        </p>
        <button
          onClick={() => {
            navigator.clipboard.writeText("v1.0.0")
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
          className="text-xs text-muted-foreground hover:text-accent transition-colors"
        >
          {copied ? "Tersalin!" : "© 2026 FrugalSide"}
        </button>
      </section>
    </main>
  )
}
