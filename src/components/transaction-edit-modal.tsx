"use client"

import { useState } from "react"
import { useFinanceStore, type Transaction } from "@/hooks/use-finance-store"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UtensilsCrossed, Gamepad2, Car, Shield, TrendingUp, Receipt, Repeat, MoreHorizontal, Briefcase, Zap } from "lucide-react"

const EXPENSE_CATEGORIES = ["Makanan", "Hiburan", "Transportasi", "Asuransi", "Investasi", "Tagihan", "Subscription", "Lainnya"]
const INCOME_CATEGORIES = ["Gaji", "Side Income", "Investasi", "Lainnya"]

type CategoryStyle = {
  icon: React.ReactNode
  bg: string
  fg: string
}

const CATEGORY_STYLE: Record<string, CategoryStyle> = {
  Makanan: { icon: <UtensilsCrossed className="h-3.5 w-3.5" />, bg: "bg-orange-100 dark:bg-orange-500/20", fg: "text-orange-600 dark:text-orange-400" },
  Hiburan: { icon: <Gamepad2 className="h-3.5 w-3.5" />, bg: "bg-purple-100 dark:bg-purple-500/20", fg: "text-purple-600 dark:text-purple-400" },
  Transportasi: { icon: <Car className="h-3.5 w-3.5" />, bg: "bg-blue-100 dark:bg-blue-500/20", fg: "text-blue-600 dark:text-blue-400" },
  Asuransi: { icon: <Shield className="h-3.5 w-3.5" />, bg: "bg-teal-100 dark:bg-teal-500/20", fg: "text-teal-600 dark:text-teal-400" },
  Investasi: { icon: <TrendingUp className="h-3.5 w-3.5" />, bg: "bg-emerald-100 dark:bg-emerald-500/20", fg: "text-emerald-600 dark:text-emerald-400" },
  Tagihan: { icon: <Receipt className="h-3.5 w-3.5" />, bg: "bg-rose-100 dark:bg-rose-500/20", fg: "text-rose-600 dark:text-rose-400" },
  Subscription: { icon: <Repeat className="h-3.5 w-3.5" />, bg: "bg-indigo-100 dark:bg-indigo-500/20", fg: "text-indigo-600 dark:text-indigo-400" },
  Gaji: { icon: <Briefcase className="h-3.5 w-3.5" />, bg: "bg-amber-100 dark:bg-amber-500/20", fg: "text-amber-600 dark:text-amber-400" },
  "Side Income": { icon: <Zap className="h-3.5 w-3.5" />, bg: "bg-cyan-100 dark:bg-cyan-500/20", fg: "text-cyan-600 dark:text-cyan-400" },
  Lainnya: { icon: <MoreHorizontal className="h-3.5 w-3.5" />, bg: "bg-gray-100 dark:bg-gray-500/20", fg: "text-gray-600 dark:text-gray-400" },
}

function CategoryIcon({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const cfg = CATEGORY_STYLE[name]
  if (!cfg) return null
  const dim = size === "sm" ? "w-6 h-6 rounded-md" : "w-7 h-7 rounded-lg"
  return <div className={`${dim} ${cfg.bg} ${cfg.fg} flex items-center justify-center flex-shrink-0`}>{cfg.icon}</div>
}

interface TransactionEditModalProps {
  transaction: Transaction
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionEditModal({ transaction, open, onOpenChange }: TransactionEditModalProps) {
  const { updateTransaction, getBalance } = useFinanceStore()

  const [type, setType] = useState<"expense" | "income">(transaction?.type ?? "expense")
  const [amount, setAmount] = useState(transaction?.amount?.toString() ?? "")
  const [category, setCategory] = useState(transaction?.category ?? EXPENSE_CATEGORIES[0])
  const [description, setDescription] = useState(transaction?.description ?? "")
  const [date, setDate] = useState(transaction?.date ?? new Date().toISOString().split("T")[0])

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const handleTabChange = (val: string) => {
    const tab = val as "expense" | "income"
    setType(tab)
    setCategory(tab === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0])
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "")
    setAmount(raw ? parseInt(raw, 10).toLocaleString("id-ID") : "")
  }

  const handleAmountFocus = () => {
    setAmount(amount.replace(/[^0-9]/g, ""))
  }

  const handleSave = () => {
    const numAmount = parseInt(amount.replace(/[^0-9]/g, ""), 10)
    if (!numAmount || numAmount <= 0) {
      toast.error("Masukkan nominal yang valid")
      return
    }

    if (type === "expense") {
      const balance = getBalance()
      const oldAmount = transaction.type === "expense" ? transaction.amount : 0
      const balanceWithoutOld = balance + oldAmount
      if (numAmount > balanceWithoutOld) {
        toast.warning("Pengeluaran melebihi saldo!")
      }
    }

    updateTransaction(transaction.id, {
      type,
      amount: numAmount,
      category,
      date,
      description: description.trim() || undefined,
    })

    toast.success("Transaksi berhasil diperbarui")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Transaksi</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <Tabs value={type} onValueChange={handleTabChange}>
            <TabsList className="w-full bg-surface-container-low dark:bg-dark border border-on-surface/5 dark:border-white/5 p-1 rounded-2xl h-auto">
              <TabsTrigger
                value="expense"
                className="flex-1 py-3 rounded-xl text-sm font-bold data-active:bg-white dark:data-active:bg-white/5 data-active:text-on-surface dark:data-active:text-white data-active:shadow-sm dark:data-active:shadow-lg dark:data-active:shadow-black/40 text-on-surface/50 dark:text-white/50"
              >
                Pengeluaran
              </TabsTrigger>
              <TabsTrigger
                value="income"
                className="flex-1 py-3 rounded-xl text-sm font-bold data-active:bg-white dark:data-active:bg-white/5 data-active:text-on-surface dark:data-active:text-white data-active:shadow-sm dark:data-active:shadow-lg dark:data-active:shadow-black/40 text-on-surface/50 dark:text-white/50"
              >
                Pemasukan
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div>
            <label className="block text-xs font-black text-on-surface/40 dark:text-white/30 uppercase tracking-widest mb-2 px-1">
              Nominal
            </label>
            <input
              className="w-full bg-surface-container-lowest dark:bg-dark border-none ring-1 ring-on-surface/10 dark:ring-white/10 focus:ring-2 focus:ring-accent rounded-2xl p-4 text-on-surface dark:text-white placeholder:text-on-surface/30 dark:placeholder:text-white/20 transition-all outline-none"
              placeholder="Contoh: 50000"
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={handleAmountChange}
              onFocus={handleAmountFocus}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-black text-on-surface/40 dark:text-white/30 uppercase tracking-widest mb-2 px-1">
              Kategori
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full bg-surface-container-lowest dark:bg-dark border-none ring-1 ring-on-surface/10 dark:ring-white/10 focus:ring-2 focus:ring-accent rounded-2xl p-4 h-auto text-on-surface dark:text-white text-left transition-all outline-none select-none">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-on-surface/5 dark:border-white/5 shadow-xl text-on-surface dark:text-white">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="rounded-xl focus:bg-accent focus:text-black cursor-pointer py-3">
                    <div className="flex items-center gap-2">
                      <CategoryIcon name={cat} />
                      <span>{cat}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-black text-on-surface/40 dark:text-white/30 uppercase tracking-widest mb-2 px-1">
              Keterangan
            </label>
            <input
              className="w-full bg-surface-container-lowest dark:bg-dark border-none ring-1 ring-on-surface/10 dark:ring-white/10 focus:ring-2 focus:ring-accent rounded-2xl p-4 text-on-surface dark:text-white placeholder:text-on-surface/30 dark:placeholder:text-white/20 transition-all outline-none"
              placeholder="Opsional"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-on-surface/40 dark:text-white/30 uppercase tracking-widest mb-2 px-1">
              Tanggal
            </label>
            <input
              className="w-full bg-surface-container-lowest dark:bg-dark border-none ring-1 ring-on-surface/10 dark:ring-white/10 focus:ring-2 focus:ring-accent rounded-2xl p-4 text-on-surface dark:text-white transition-all outline-none [color-scheme:light] dark:[color-scheme:dark]"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              className="flex-1 bg-accent text-on-primary-fixed font-black py-4 rounded-2xl hover:brightness-105 dark:hover:brightness-110 transition-all duration-300 transform active:scale-95 shadow-lg hover:shadow-accent/40 cursor-pointer"
              onClick={handleSave}
            >
              Simpan Perubahan
            </button>
            <button
              className="flex-1 border border-on-surface/10 dark:border-white/10 text-on-surface dark:text-white font-medium py-4 rounded-2xl hover:bg-on-surface/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
