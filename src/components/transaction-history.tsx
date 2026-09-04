"use client"

import type { Transaction } from "@/hooks/use-finance-store"
import { useFinanceStore } from "@/hooks/use-finance-store"
import { Pencil, Trash2, Search, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionEditModal } from "@/components/transaction-edit-modal"
import { CategoryIcon } from "@/components/transaction-form"
import { toast } from "sonner"
import { useState, useMemo } from "react"

interface TransactionHistoryProps {
  transactions: Transaction[]
}

type DateGroup = {
  date: string
  label: string
  total: number
  transactions: Transaction[]
}

type SelectionMode = "edit" | "delete" | null

function groupByDate(transactions: Transaction[]): DateGroup[] {
  const map = new Map<string, Transaction[]>()
  for (const t of transactions) {
    const existing = map.get(t.date)
    if (existing) {
      existing.push(t)
    } else {
      map.set(t.date, [t])
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([date, txns]) => {
      const d = new Date(date)
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      let label: string
      if (d.toDateString() === today.toDateString()) {
        label = "Hari Ini"
      } else if (d.toDateString() === yesterday.toDateString()) {
        label = "Kemarin"
      } else {
        label = d.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      }

      const total = txns.reduce((acc, t) => acc + t.amount, 0)
      return { date, label, total, transactions: txns }
    })
}

function TransactionList({
  transactions,
  formatRupiah,
  onDelete,
  onEdit,
  redTotal = false,
  selectionMode,
  onSelect,
  onCancelSelection,
}: {
  transactions: Transaction[]
  formatRupiah: (amount: number) => string
  onDelete: (id: string) => void
  onEdit: (t: Transaction) => void
  redTotal?: boolean
  selectionMode: SelectionMode
  onSelect: (t: Transaction) => void
  onCancelSelection: () => void
}) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const handleDelete = () => {
    if (!pendingDeleteId) return
    onDelete(pendingDeleteId)
    toast.success("Transaksi berhasil dihapus")
    setPendingDeleteId(null)
  }

  const dateGroups = useMemo(() => groupByDate(transactions), [transactions])

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 bg-surface-container-low dark:bg-white/5 rounded-2xl flex items-center justify-center mb-3 text-on-surface/20 dark:text-white/20">
          <Search className="h-7 w-7" />
        </div>
        <p className="text-on-surface/40 dark:text-white/40 font-medium text-sm">
          Tidak ada transaksi
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {selectionMode && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-accent/10 border border-accent/20">
          <span className="text-sm font-bold text-accent">
            Pilih transaksi untuk di{selectionMode === "edit" ? "ubah" : "hapus"}
          </span>
          <button
            className="text-xs font-bold text-on-surface/50 dark:text-white/50 hover:text-on-surface dark:hover:text-white cursor-pointer"
            onClick={onCancelSelection}
          >
            Batal
          </button>
        </div>
      )}

      {dateGroups.map((group) => (
        <div key={group.date}>
          <div className="flex items-center justify-between mb-2 px-1">
            <h4 className="text-xs font-bold text-on-surface/50 dark:text-white/50 uppercase tracking-wide">
              {group.label}
            </h4>
            <span className={`text-xs font-bold tabular-nums ${
              redTotal ? "text-danger" : group.total >= 0 ? "text-success" : "text-danger"
            }`}>
              {formatRupiah(group.total)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-on-surface/5 dark:border-white/5 text-xs font-black text-on-surface/30 dark:text-white/30 uppercase tracking-widest">
                  {selectionMode && <th className="py-3 px-2 w-[40px]" />}
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  {!selectionMode && <th className="hidden md:table-cell py-3 px-4 w-[80px]" />}
                </tr>
              </thead>
              <tbody>
                {group.transactions.map((t) => (
                  <tr
                    key={t.id}
                    className={`border-b border-on-surface/5 dark:border-white/5 transition-colors group ${
                      selectionMode
                        ? "cursor-pointer hover:bg-accent/10 dark:hover:bg-accent/10"
                        : "hover:bg-on-surface/5 dark:hover:bg-white/5"
                    }`}
                    onClick={() => selectionMode && onSelect(t)}
                  >
                    {selectionMode && (
                      <td className="py-4 px-2">
                        <div className="w-5 h-5 rounded-full border-2 border-on-surface/20 dark:border-white/20 flex items-center justify-center">
                          {selectionMode === "edit" ? (
                            <Pencil className="h-3 w-3 text-on-surface/30 dark:text-white/30" />
                          ) : (
                            <Trash2 className="h-3 w-3 text-on-surface/30 dark:text-white/30" />
                          )}
                        </div>
                      </td>
                    )}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <CategoryIcon name={t.category} />
                        <div className="flex flex-col gap-1 min-w-0">
                          {t.description && (
                            <div className="text-sm text-on-surface/70 dark:text-white/70 line-clamp-1 max-w-[200px] md:max-w-xs">
                              {t.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td
                      className={`py-4 px-4 text-right font-black ${
                        t.type === "income" ? "text-success" : "text-danger"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"} {formatRupiah(t.amount)}
                    </td>
                    {!selectionMode && (
                      <td className="hidden md:table-cell py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="p-2 text-on-surface/30 dark:text-white/30 hover:text-accent rounded-xl hover:bg-on-surface/5 dark:hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                            aria-label="Edit Transaksi"
                            onClick={(e) => { e.stopPropagation(); onEdit(t) }}
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="p-2 text-on-surface/30 dark:text-white/30 hover:text-danger rounded-xl hover:bg-on-surface/5 dark:hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                                aria-label="Hapus Transaksi"
                                onClick={(e) => { e.stopPropagation(); setPendingDeleteId(t.id) }}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Transaksi</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Yakin ingin menghapus transaksi {t.category} sebesar{" "}
                                  {formatRupiah(t.amount)}? Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setPendingDeleteId(null)}>
                                  Batal
                                </AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>
                                  Ya, Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const { deleteTransaction, formatRupiah } = useFinanceStore()
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const allCategories = useMemo(
    () => [...new Set(transactions.map((t) => t.category))],
    [transactions]
  )

  const baseFiltered = useMemo(() => {
    let result = [...transactions]

    if (categoryFilter !== "all") {
      result = result.filter((t) => t.category === categoryFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.amount.toString().includes(q)
      )
    }

    return result
  }, [transactions, categoryFilter, searchQuery])

  const incomeTransactions = useMemo(() => baseFiltered.filter((t) => t.type === "income"), [baseFiltered])
  const expenseTransactions = useMemo(() => baseFiltered.filter((t) => t.type === "expense"), [baseFiltered])

  const incomeTotal = useMemo(
    () => incomeTransactions.reduce((acc, t) => acc + t.amount, 0),
    [incomeTransactions]
  )
  const expenseTotal = useMemo(
    () => expenseTransactions.reduce((acc, t) => acc + t.amount, 0),
    [expenseTransactions]
  )

  const handleSelectTransaction = (t: Transaction) => {
    if (selectionMode === "edit") {
      setEditingTransaction(t)
      setSelectionMode(null)
    } else if (selectionMode === "delete") {
      setDeleteConfirmId(t.id)
      setSelectionMode(null)
    }
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return
    deleteTransaction(deleteConfirmId)
    toast.success("Transaksi berhasil dihapus")
    setDeleteConfirmId(null)
  }

  const deleteTarget = deleteConfirmId
    ? transactions.find((t) => t.id === deleteConfirmId)
    : null

  return (
    <section className="pb-10" data-purpose="transaction-history">
      <div className="bg-card border border-on-surface/5 dark:border-white/5 rounded-3xl overflow-hidden shadow-lg dark:shadow-2xl">
        <div className="max-sm:p-5 p-8 border-b border-on-surface/5 dark:border-white/5">
          <h3 className="max-sm:text-lg text-xl font-bold flex items-center gap-2 text-on-surface dark:text-white mb-4">
            <span className="w-1.5 h-6 bg-accent rounded-full" />
            Riwayat Transaksi
          </h3>

          {transactions.length > 0 && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface/30 dark:text-white/30" />
                <input
                  className="w-full bg-surface-container-lowest dark:bg-dark border-none ring-1 ring-on-surface/10 dark:ring-white/10 focus:ring-2 focus:ring-accent rounded-2xl py-3 pl-11 pr-10 text-sm text-on-surface dark:text-white placeholder:text-on-surface/30 dark:placeholder:text-white/20 transition-all outline-none"
                  placeholder="Cari transaksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface/30 dark:text-white/30 hover:text-on-surface dark:hover:text-white cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <select
                className="bg-surface-container-low dark:bg-white/5 border-none rounded-xl px-3 py-2 text-xs font-medium text-on-surface/50 dark:text-white/50 outline-none cursor-pointer"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Semua Kategori</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="p-4">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-4xl">
                💰
              </div>
              <h3 className="text-2xl font-black text-on-surface dark:text-white mb-3">
                Mulai Catat Keuanganmu
              </h3>
              <p className="text-on-surface/50 dark:text-white/50 max-w-md mx-auto mb-8 leading-relaxed">
                Yuk mulai catat transaksi pertamamu untuk melihat perkembangan keuanganmu dengan mudah dan menyenangkan!
              </p>
              <button
                className="bg-accent text-on-primary-fixed font-black py-4 px-8 rounded-2xl hover:brightness-105 dark:hover:brightness-110 transition-all duration-300 transform active:scale-95 shadow-lg hover:shadow-accent/40 cursor-pointer inline-flex items-center gap-2 group"
                onClick={() => {
                  document.querySelector('[data-purpose="transaction-input"]')?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Catat Sekarang
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                {[
                  { icon: "✏️", label: "Catat setiap pengeluaran", desc: "Pantau ke mana uangmu pergi" },
                  { icon: "💵", label: "Pisahkan pemasukan", desc: "Catat semua sumber pendapatan" },
                  { icon: "📈", label: "Pantau grafik mingguan", desc: "Lihat pola pengeluaranmu" },
                ].map((tip) => (
                  <div key={tip.label} className="bg-surface-container-low dark:bg-white/[0.03] rounded-2xl p-5 text-left border border-on-surface/5 dark:border-white/5">
                    <span className="text-2xl block mb-2">{tip.icon}</span>
                    <p className="text-sm font-bold text-on-surface dark:text-white mb-1">{tip.label}</p>
                    <p className="text-xs text-on-surface/40 dark:text-white/40">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Tabs defaultValue="income">
              <TabsList className="w-full mb-3">
                <TabsTrigger value="income" className="flex-1">
                  Pemasukan
                </TabsTrigger>
                <TabsTrigger value="expense" className="flex-1">
                  Pengeluaran
                </TabsTrigger>
              </TabsList>

              <div className="flex gap-2 mb-4">
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectionMode === "edit"
                      ? "bg-accent text-on-primary-fixed"
                      : "bg-surface-container-low dark:bg-white/5 text-on-surface/50 dark:text-white/50 hover:text-on-surface dark:hover:text-white"
                  }`}
                  onClick={() => setSelectionMode(selectionMode === "edit" ? null : "edit")}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Ubah
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectionMode === "delete"
                      ? "bg-danger text-white"
                      : "bg-surface-container-low dark:bg-white/5 text-on-surface/50 dark:text-white/50 hover:text-on-surface dark:hover:text-white"
                  }`}
                  onClick={() => setSelectionMode(selectionMode === "delete" ? null : "delete")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus
                </button>
              </div>

              <TabsContent value="income">
                {incomeTransactions.length > 0 && (
                  <div className="mb-3 flex items-center justify-end">
                    <span className="text-sm font-bold text-success">
                      + {formatRupiah(incomeTotal)}
                    </span>
                  </div>
                )}
                <TransactionList
                  transactions={incomeTransactions}
                  formatRupiah={formatRupiah}
                  onDelete={deleteTransaction}
                  onEdit={setEditingTransaction}
                  selectionMode={selectionMode}
                  onSelect={handleSelectTransaction}
                  onCancelSelection={() => setSelectionMode(null)}
                />
              </TabsContent>

              <TabsContent value="expense">
                {expenseTransactions.length > 0 && (
                  <div className="mb-3 flex items-center justify-end">
                    <span className="text-sm font-bold text-danger">
                      - {formatRupiah(expenseTotal)}
                    </span>
                  </div>
                )}
                <TransactionList
                  transactions={expenseTransactions}
                  formatRupiah={formatRupiah}
                  onDelete={deleteTransaction}
                  onEdit={setEditingTransaction}
                  redTotal
                  selectionMode={selectionMode}
                  onSelect={handleSelectTransaction}
                  onCancelSelection={() => setSelectionMode(null)}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      <TransactionEditModal
        transaction={editingTransaction!}
        open={!!editingTransaction}
        onOpenChange={(open) => { if (!open) setEditingTransaction(null) }}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-on-surface dark:text-white">Hapus Transaksi</h3>
            <p className="text-sm text-muted-foreground">
              Yakin ingin menghapus transaksi {deleteTarget.category} sebesar{" "}
              {formatRupiah(deleteTarget.amount)}? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-3.5 rounded-2xl border border-border text-on-surface dark:text-white font-semibold text-sm cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => setDeleteConfirmId(null)}
              >
                Batal
              </button>
              <button
                className="flex-1 px-4 py-3.5 rounded-2xl bg-danger text-white font-bold text-sm cursor-pointer active:scale-[0.98] transition-transform"
                onClick={handleConfirmDelete}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
