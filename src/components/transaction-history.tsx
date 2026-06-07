"use client"

import type { Transaction } from "@/hooks/use-finance-store"
import { useFinanceStore } from "@/hooks/use-finance-store"
import { Trash2 } from "lucide-react"
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
import { toast } from "sonner"
import { useState } from "react"

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const { deleteTransaction, formatRupiah } = useFinanceStore()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const handleDelete = () => {
    if (!pendingDeleteId) return
    deleteTransaction(pendingDeleteId)
    toast.success("Transaksi berhasil dihapus")
    setPendingDeleteId(null)
  }

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <section className="pb-10" data-purpose="transaction-history">
      <div className="bg-card border border-on-surface/5 dark:border-white/5 rounded-3xl overflow-hidden shadow-lg dark:shadow-2xl">
        <div className="p-8 border-b border-on-surface/5 dark:border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-bold flex items-center gap-2 text-on-surface dark:text-white">
            <span className="w-1.5 h-6 bg-accent rounded-full" />
            Riwayat Transaksi
          </h3>
          {sorted.length > 0 && (
            <span className="text-xs text-on-surface/40 dark:text-white/40 font-medium">
              {sorted.length} transaksi
            </span>
          )}
        </div>

        <div className="p-4">
          {sorted.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-on-surface/5 dark:border-white/5 text-xs font-black text-on-surface/30 dark:text-white/30 uppercase tracking-widest">
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-right">Nominal</th>
                    <th className="py-3 px-4 w-[80px]" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-on-surface/5 dark:border-white/5 hover:bg-on-surface/5 dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="py-4 px-4 font-medium text-on-surface/80 dark:text-white/80">
                        {new Date(t.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-on-surface dark:text-white">
                          {t.category}
                        </div>
                        {t.description && (
                          <div className="text-xs text-on-surface/40 dark:text-white/40 mt-0.5 line-clamp-1 max-w-[200px] md:max-w-xs">
                            {t.description}
                          </div>
                        )}
                      </td>
                      <td
                        className={`py-4 px-4 text-right font-black ${
                          t.type === "income" ? "text-success" : "text-danger"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"} {formatRupiah(t.amount)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="p-2 text-on-surface/30 dark:text-white/30 hover:text-danger rounded-xl hover:bg-on-surface/5 dark:hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                              aria-label="Hapus Transaksi"
                              onClick={() => setPendingDeleteId(t.id)}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-surface-container-low dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-on-surface/10 dark:text-white/10">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </div>
              <p className="text-on-surface/30 dark:text-white/30 italic font-medium">
                Belum ada transaksi
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
