"use client"

interface QuickStatsProps {
  balance: string
  monthlyIncome: string
  monthlyExpense: string
  incomeStatus?: string
  expenseStatus?: string
}

export function QuickStats({
  balance,
  monthlyIncome,
  monthlyExpense,
  incomeStatus = "Stable",
  expenseStatus = "Normal",
}: QuickStatsProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6" data-purpose="financial-summary">
      <div className="bg-gradient-to-br from-accent to-primary-container p-8 rounded-3xl shadow-xl shadow-accent/20 dark:shadow-accent/10 relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 dark:bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
        <p className="text-on-primary-fixed/70 font-bold mb-1 uppercase tracking-widest text-xs">Total Saldo</p>
        <h2 className="text-4xl font-black mb-4 text-on-primary-fixed">{balance}</h2>
        <div className="flex items-center gap-2 text-sm bg-on-primary-fixed/10 text-on-primary-fixed w-fit px-3 py-1 rounded-full backdrop-blur-md">
          <span className="w-2 h-2 bg-on-primary-fixed rounded-full animate-pulse" />
          Safe to spend
        </div>
      </div>

      <div className="bg-card border border-on-surface/5 dark:border-white/5 p-8 rounded-3xl flex flex-col justify-between hover:border-success/30 transition-all duration-300 shadow-sm dark:shadow-none">
        <div>
          <p className="text-on-surface/40 dark:text-white/40 font-bold mb-1 uppercase tracking-widest text-xs">Pemasukan Bulan Ini</p>
          <h2 className="text-3xl font-bold text-success">{monthlyIncome}</h2>
        </div>
        <div className="mt-4 flex items-center gap-2 text-success/70 dark:text-success/60 text-sm font-semibold">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
          </svg>
          {incomeStatus}
        </div>
      </div>

      <div className="bg-card border border-on-surface/5 dark:border-white/5 p-8 rounded-3xl flex flex-col justify-between hover:border-danger/30 transition-all duration-300 shadow-sm dark:shadow-none">
        <div>
          <p className="text-on-surface/40 dark:text-white/40 font-bold mb-1 uppercase tracking-widest text-xs">Pengeluaran Bulan Ini</p>
          <h2 className="text-3xl font-bold text-danger">{monthlyExpense}</h2>
        </div>
        <div className="mt-4 flex items-center gap-2 text-danger/70 dark:text-danger/60 text-sm font-semibold">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
          </svg>
          {expenseStatus}
        </div>
      </div>
    </section>
  )
}
