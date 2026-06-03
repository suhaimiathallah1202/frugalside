"use client";

import { useState } from "react";
import { useFinanceStore } from "@/hooks/use-finance-store";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const EXPENSE_CATEGORIES = [
  "Makanan",
  "Hiburan",
  "Transportasi",
  "Asuransi",
  "Investasi",
  "Tagihan",
  "Subscription",
  "Lainnya",
];

const INCOME_CATEGORIES = [
  "Gaji",
  "Side Income",
  "Investasi",
  "Lainnya",
];

export default function Dashboard() {
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    getBalance,
    formatRupiah,
    isHydrated,
  } = useFinanceStore();

  const { theme, setTheme } = useTheme();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");

  if (!isHydrated) return null;

  const handleTabChange = (val: "expense" | "income") => {
    setActiveTab(val);
    setCategory(val === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  };

  const handleSave = () => {
    if (!amount || !category || !date) return;
    addTransaction({
      type: activeTab,
      amount: parseFloat(amount),
      category,
      date,
      description: description.trim() || undefined,
    });
    // Reset form
    setAmount("");
    setDescription("");
    setCategory(activeTab === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
    setDate(new Date().toISOString().split("T")[0]);
  };

  const balance = getBalance();

  // Monthly stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyExpense = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  // Chart data
  const chartData = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc: any[], t) => {
      const existing = acc.find((item) => item.name === t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount });
      }
      return acc;
    }, []);

  // Adaptive COLORS array based on light/dark mode for the chart
  const COLORS = theme === "light" 
    ? ["#abd600", "#006a6a", "#ba1a1a", "#506600", "#a855f7", "#ec4899", "#f59e0b"]
    : ["#abd600", "#22d3ee", "#f43f5e", "#c3f400", "#a855f7", "#ec4899", "#f59e0b"];

  return (
    <div className="bg-dark text-on-surface dark:text-white font-sans selection:bg-accent selection:text-black min-h-screen pb-20 transition-colors duration-300">
      {/* BEGIN: MainHeader */}
      <header className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center" data-purpose="site-navigation">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-accent to-primary-container rounded-xl flex items-center justify-center font-black text-xl text-on-primary-fixed shadow-lg shadow-accent/20">
            F
          </div>
          <h1 className="text-2xl font-black tracking-tight text-on-surface dark:text-white">Frugal<span className="text-accent">Side</span></h1>
        </div>
        <button
          aria-label="Toggle Theme"
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-card border border-on-surface/5 dark:border-white/5 hover:border-accent/50 transition-all duration-300 shadow-sm dark:shadow-none"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? (
            <svg className="h-6 w-6 text-on-surface/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          ) : (
            <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
          )}
        </button>
      </header>
      {/* END: MainHeader */}

      <main className="max-w-7xl mx-auto px-6 space-y-8">
        {/* BEGIN: QuickStats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6" data-purpose="financial-summary">
          {/* Total Saldo Card */}
          <div className="bg-gradient-to-br from-accent to-primary-container p-8 rounded-3xl shadow-xl shadow-accent/20 dark:shadow-accent/10 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 dark:bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500"></div>
            <p className="text-on-primary-fixed/70 font-bold mb-1 uppercase tracking-widest text-xs">Total Saldo</p>
            <h2 className="text-4xl font-black mb-4 text-on-primary-fixed">{formatRupiah(balance)}</h2>
            <div className="flex items-center gap-2 text-sm bg-on-primary-fixed/10 text-on-primary-fixed w-fit px-3 py-1 rounded-full backdrop-blur-md">
              <span className="w-2 h-2 bg-on-primary-fixed rounded-full animate-pulse"></span>
              Safe to spend
            </div>
          </div>

          {/* Income Card */}
          <div className="bg-card border border-on-surface/5 dark:border-white/5 p-8 rounded-3xl flex flex-col justify-between hover:border-success/30 transition-all duration-300 shadow-sm dark:shadow-none">
            <div>
              <p className="text-on-surface/40 dark:text-white/40 font-bold mb-1 uppercase tracking-widest text-xs">Pemasukan Bulan Ini</p>
              <h2 className="text-3xl font-bold text-success">{formatRupiah(monthlyIncome)}</h2>
            </div>
            <div className="mt-4 flex items-center gap-2 text-success/70 dark:text-success/60 text-sm font-semibold">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path>
              </svg>
              Stable
            </div>
          </div>

          {/* Expense Card */}
          <div className="bg-card border border-on-surface/5 dark:border-white/5 p-8 rounded-3xl flex flex-col justify-between hover:border-danger/30 transition-all duration-300 shadow-sm dark:shadow-none">
            <div>
              <p className="text-on-surface/40 dark:text-white/40 font-bold mb-1 uppercase tracking-widest text-xs">Pengeluaran Bulan Ini</p>
              <h2 className="text-3xl font-bold text-danger">{formatRupiah(monthlyExpense)}</h2>
            </div>
            <div className="mt-4 flex items-center gap-2 text-danger/70 dark:text-danger/60 text-sm font-semibold">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd"></path>
              </svg>
              Normal
            </div>
          </div>
        </section>
        {/* END: QuickStats */}

        {/* BEGIN: MainGrid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Transaction Form */}
          <section className="lg:col-span-5 space-y-6" data-purpose="transaction-input">
            <div className="bg-card border border-on-surface/5 dark:border-white/5 p-8 rounded-3xl h-full shadow-lg dark:shadow-2xl">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-on-surface dark:text-white">
                <span className="w-1.5 h-6 bg-accent rounded-full"></span>
                Catat Transaksi
              </h3>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                {/* Toggle Switch */}
                <div className="p-1.5 bg-surface-container-low dark:bg-dark rounded-2xl flex gap-1 border border-on-surface/5 dark:border-white/5">
                  <button
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                      activeTab === "expense"
                        ? "bg-white dark:bg-white/5 border border-on-surface/10 dark:border-white/10 text-on-surface dark:text-white shadow-sm dark:shadow-lg dark:shadow-black/40"
                        : "text-on-surface/50 dark:text-white/50 hover:text-on-surface dark:hover:text-white"
                    }`}
                    onClick={() => handleTabChange("expense")}
                    type="button"
                  >
                    Pengeluaran
                  </button>
                  <button
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                      activeTab === "income"
                        ? "bg-white dark:bg-white/5 border border-on-surface/10 dark:border-white/10 text-on-surface dark:text-white shadow-sm dark:shadow-lg dark:shadow-black/40"
                        : "text-on-surface/50 dark:text-white/50 hover:text-on-surface dark:hover:text-white"
                    }`}
                    onClick={() => handleTabChange("income")}
                    type="button"
                  >
                    Pemasukan
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Nominal */}
                  <div>
                    <label className="block text-xs font-black text-on-surface/40 dark:text-white/30 uppercase tracking-widest mb-2 px-1">Nominal</label>
                    <input
                      className="w-full bg-surface-container-lowest dark:bg-dark border-none ring-1 ring-on-surface/10 dark:ring-white/10 focus:ring-2 focus:ring-accent rounded-2xl p-4 text-on-surface dark:text-white placeholder:text-on-surface/30 dark:placeholder:text-white/20 transition-all outline-none"
                      placeholder="Contoh: 50000"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  {/* Kategori Dropdown */}
                  <div>
                    <label className="block text-xs font-black text-on-surface/40 dark:text-white/30 uppercase tracking-widest mb-2 px-1">Kategori</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-full bg-surface-container-lowest dark:bg-dark border-none ring-1 ring-on-surface/10 dark:ring-white/10 focus:ring-2 focus:ring-accent rounded-2xl p-4 h-auto text-on-surface dark:text-white text-left transition-all outline-none select-none data-placeholder:text-on-surface/30 dark:data-placeholder:text-white/20">
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border border-on-surface/5 dark:border-white/5 rounded-2xl shadow-xl text-on-surface dark:text-white">
                        {(activeTab === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                          <SelectItem
                            key={cat}
                            value={cat}
                            className="rounded-xl focus:bg-accent focus:text-black cursor-pointer py-3"
                          >
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Keterangan */}
                  <div>
                    <label className="block text-xs font-black text-on-surface/40 dark:text-white/30 uppercase tracking-widest mb-2 px-1">Keterangan</label>
                    <input
                      className="w-full bg-surface-container-lowest dark:bg-dark border-none ring-1 ring-on-surface/10 dark:ring-white/10 focus:ring-2 focus:ring-accent rounded-2xl p-4 text-on-surface dark:text-white placeholder:text-on-surface/30 dark:placeholder:text-white/20 transition-all outline-none"
                      placeholder="Contoh: Makan siang bakso, dll. (Opsional)"
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Tanggal */}
                  <div>
                    <label className="block text-xs font-black text-on-surface/40 dark:text-white/30 uppercase tracking-widest mb-2 px-1">Tanggal</label>
                    <div className="relative">
                      <input
                        className="w-full bg-surface-container-lowest dark:bg-dark border-none ring-1 ring-on-surface/10 dark:ring-white/10 focus:ring-2 focus:ring-accent rounded-2xl p-4 text-on-surface dark:text-white transition-all outline-none [color-scheme:light] dark:[color-scheme:dark]"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  className="w-full bg-accent text-on-primary-fixed font-black py-5 rounded-2xl hover:brightness-105 dark:hover:brightness-110 transition-all duration-300 transform active:scale-95 shadow-lg hover:shadow-accent/40 flex items-center justify-center gap-2 group cursor-pointer"
                  onClick={handleSave}
                  type="button"
                >
                  <svg className="h-6 w-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                  </svg>
                  Simpan Transaksi
                </button>
              </form>
            </div>
          </section>

          {/* Distribution Chart */}
          <section className="lg:col-span-7" data-purpose="spending-analysis">
            <div className="bg-card border border-on-surface/5 dark:border-white/5 p-8 rounded-3xl h-full flex flex-col shadow-lg dark:shadow-2xl">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-on-surface dark:text-white">
                <span className="w-1.5 h-6 bg-success rounded-full"></span>
                Distribusi Pengeluaran
              </h3>
              <div className="flex-grow flex flex-col min-h-[350px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                        formatter={(value) => <span className="text-sm text-on-surface/80 dark:text-slate-300">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-on-surface/10 dark:border-white/5 rounded-3xl p-12 text-center group hover:border-accent/30 transition-all">
                    <div className="w-24 h-24 mb-6 rounded-full bg-surface-container-low dark:bg-white/5 flex items-center justify-center text-on-surface/20 dark:text-white/20 group-hover:text-accent transition-colors">
                      <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                        <path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                      </svg>
                    </div>
                    <p className="text-on-surface/40 dark:text-white/40 font-medium italic">"Belum ada data pengeluaran untuk dianalisis."</p>
                    <p className="text-xs text-on-surface/30 dark:text-white/20 mt-2">Mulai catat transaksi pertamamu sekarang!</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
        {/* END: MainGrid */}

        {/* BEGIN: HistorySection */}
        <section className="pb-10" data-purpose="transaction-history">
          <div className="bg-card border border-on-surface/5 dark:border-white/5 rounded-3xl overflow-hidden shadow-lg dark:shadow-2xl">
            <div className="p-8 border-b border-on-surface/5 dark:border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2 text-on-surface dark:text-white">
                <span className="w-1.5 h-6 bg-accent rounded-full"></span>
                Riwayat Transaksi
              </h3>
            </div>
            {/* Simplified List for Gen Z Feel */}
            <div className="p-4">
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-on-surface/5 dark:border-white/5 px-4 py-3 text-xs font-black text-on-surface/30 dark:text-white/30 uppercase tracking-widest">
                        <th className="py-3 px-4">Tanggal</th>
                        <th className="py-3 px-4">Kategori</th>
                        <th className="py-3 px-4 text-right">Nominal</th>
                        <th className="py-3 px-4 w-[80px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...transactions]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((t) => (
                          <tr key={t.id} className="border-b border-on-surface/5 dark:border-white/5 hover:bg-on-surface/5 dark:hover:bg-white/5 transition-colors group">
                            <td className="py-4 px-4 font-medium text-on-surface/80 dark:text-white/80">
                              {new Date(t.date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-semibold text-on-surface dark:text-white">{t.category}</div>
                              {t.description && (
                                <div className="text-xs text-on-surface/40 dark:text-white/40 mt-0.5 line-clamp-1 max-w-[200px] md:max-w-xs">
                                  {t.description}
                                </div>
                              )}
                            </td>
                            <td className={`py-4 px-4 text-right font-black ${
                              t.type === "income" ? "text-success" : "text-danger"
                            }`}>
                              {t.type === "income" ? "+" : "-"} {formatRupiah(t.amount)}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button
                                className="p-2 text-on-surface/30 dark:text-white/30 hover:text-danger rounded-xl hover:bg-on-surface/5 dark:hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                                onClick={() => deleteTransaction(t.id)}
                                aria-label="Hapus Transaksi"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-surface-container-low dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-on-surface/10 dark:text-white/10">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </div>
                  <p className="text-on-surface/30 dark:text-white/30 italic font-medium">Belum ada transaksi</p>
                </div>
              )}
            </div>
          </div>
        </section>
        {/* END: HistorySection */}
      </main>

      {/* BEGIN: FloatingActions */}
      <div className="fixed bottom-6 right-6 lg:hidden" data-purpose="mobile-fab">
        <button
          className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-2xl shadow-accent/50 animate-float-ui text-on-primary-fixed hover:scale-105 active:scale-95 transition-transform duration-300 cursor-pointer"
          onClick={() => {
            const formEl = document.querySelector('[data-purpose="transaction-input"]');
            formEl?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
          </svg>
        </button>
      </div>
      {/* END: FloatingActions */}
    </div>
  );
}
