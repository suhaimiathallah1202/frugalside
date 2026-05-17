"use client";

import { useState } from "react";
import { useFinanceStore } from "@/hooks/use-finance-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Wallet, TrendingUp, TrendingDown, PlusCircle, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function Dashboard() {
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    getSummary,
    getBalance,
    formatRupiah,
    isHydrated,
  } = useFinanceStore();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");

  if (!isHydrated) return null;

  const handleSave = () => {
    if (!amount || !category || !date) return;
    addTransaction({
      type: activeTab,
      amount: parseFloat(amount),
      category,
      date,
    });
    // Reset form
    setAmount("");
    setCategory("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const balance = getBalance();
  const summary = getSummary();

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

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Frugal<span className="text-indigo-600">Side</span>
        </h1>
        <ThemeToggle />
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        {/* Top Section: Summary */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 text-white border-none shadow-xl overflow-hidden relative">
            <div className="absolute right-[-10%] top-[-10%] opacity-10">
              <Wallet size={120} />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2">
                <Wallet className="h-6 w-6 text-indigo-400" />
                {formatRupiah(balance)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Pemasukan Bulan Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {formatRupiah(monthlyIncome)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Pengeluaran Bulan Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600 flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                {formatRupiah(monthlyExpense)}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Middle Section: Grid 2 Column */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Input */}
          <Card className="shadow-lg border-none">
            <CardHeader>
              <CardTitle className="text-lg">Catat Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="expense"
                onValueChange={(v) => setActiveTab(v as "expense" | "income")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
                  <TabsTrigger value="income">Pemasukan</TabsTrigger>
                </TabsList>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nominal</label>
                    <Input
                      type="number"
                      placeholder="Contoh: 50000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kategori</label>
                    <Input
                      placeholder="Contoh: Makanan, Gaji, dsb."
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tanggal</label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md active:scale-[0.98]"
                    onClick={handleSave}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Simpan Transaksi
                  </Button>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Right: Chart */}
          <Card className="shadow-lg border-none flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Distribusi Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 italic">
                  Belum ada data pengeluaran
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Bottom Section: Table */}
        <section>
          <Card className="shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-800">
              <CardTitle className="text-lg">Riwayat Transaksi</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 dark:bg-slate-900/20 hover:bg-transparent">
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    [...transactions]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((t) => (
                        <TableRow key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 group">
                          <TableCell className="font-medium">
                            {new Date(t.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>{t.category}</TableCell>
                          <TableCell
                            className={`text-right font-semibold ${
                              t.type === "income" ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {t.type === "income" ? "+" : "-"} {formatRupiah(t.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-rose-600 transition-colors"
                              onClick={() => deleteTransaction(t.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                        Belum ada transaksi
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
