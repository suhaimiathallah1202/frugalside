"use client"

import { useState, useEffect } from "react"
import { useFinanceStore } from "@/hooks/use-finance-store"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const EXPENSE_CATEGORIES = [
  "Makanan",
  "Hiburan",
  "Transportasi",
  "Asuransi",
  "Investasi",
  "Tagihan",
  "Subscription",
  "Lainnya",
]

const INCOME_CATEGORIES = [
  "Gaji",
  "Side Income",
  "Investasi",
  "Lainnya",
]

type Errors = {
  amount?: string
  date?: string
}

interface TransactionFormProps {
  selectedMonth?: Date
}

export function TransactionForm({ selectedMonth }: TransactionFormProps) {
  const { addTransaction } = useFinanceStore()

  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense")
  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    if (selectedMonth) {
      const y = selectedMonth.getFullYear()
      const m = String(selectedMonth.getMonth() + 1).padStart(2, "0")
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDate(`${y}-${m}-01`)
    }
  }, [selectedMonth])

  const categories = activeTab === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const handleTabChange = (val: string) => {
    const tab = val as "expense" | "income"
    setActiveTab(tab)
    setCategory(tab === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0])
    setErrors({})
  }

  const validate = (): boolean => {
    const newErrors: Errors = {}
    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ""))
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = "Masukkan nominal yang valid"
    }
    if (!date) {
      newErrors.date = "Pilih tanggal transaksi"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ""))

    addTransaction({
      type: activeTab,
      amount: numAmount,
      category,
      date,
      description: description.trim() || undefined,
    })

    toast.success(
      activeTab === "expense" ? "Pengeluaran berhasil dicatat" : "Pemasukan berhasil dicatat"
    )

    setAmount("")
    setDescription("")
    setCategory(categories[0])
    setDate(new Date().toISOString().split("T")[0])
    setErrors({})
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
  }

  const handleAmountBlur = () => {
    if (!amount) return
    const num = amount.replace(/[^0-9]/g, "")
    if (num) {
      setAmount(parseInt(num, 10).toLocaleString("id-ID"))
    }
  }

  const handleAmountFocus = () => {
    setAmount(amount.replace(/\./g, ""))
  }

  return (
    <section className="lg:col-span-5 space-y-6" data-purpose="transaction-input">
      <div className="bg-card border border-on-surface/5 dark:border-white/5 p-8 rounded-3xl h-full shadow-lg dark:shadow-2xl">
        <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-on-surface dark:text-white">
          <span className="w-1.5 h-6 bg-accent rounded-full" />
          Catat Transaksi
        </h3>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()} onKeyDown={handleKeyDown}>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
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

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-on-surface/40 dark:text-white/30 uppercase tracking-widest mb-2 px-1">
                Nominal
              </label>
              <input
                className={`w-full bg-surface-container-lowest dark:bg-dark border-none ring-1 ${
                  errors.amount ? "ring-danger" : "ring-on-surface/10 dark:ring-white/10"
                } focus:ring-2 focus:ring-accent rounded-2xl p-4 text-on-surface dark:text-white placeholder:text-on-surface/30 dark:placeholder:text-white/20 transition-all outline-none`}
                placeholder="Contoh: 50000"
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, "")
                  setAmount(val)
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }))
                }}
                onBlur={handleAmountBlur}
                onFocus={handleAmountFocus}
                aria-invalid={!!errors.amount}
              />
              {errors.amount && (
                <p className="text-danger text-xs mt-1.5 px-1 font-medium">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-on-surface/40 dark:text-white/30 uppercase tracking-widest mb-2 px-1">
                Kategori
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full bg-surface-container-lowest dark:bg-dark border-none ring-1 ring-on-surface/10 dark:ring-white/10 focus:ring-2 focus:ring-accent rounded-2xl p-4 h-auto text-on-surface dark:text-white text-left transition-all outline-none select-none">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-on-surface/5 dark:border-white/5 rounded-2xl shadow-xl text-on-surface dark:text-white">
                  {categories.map((cat) => (
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

            <div>
              <label className="block text-xs font-black text-on-surface/40 dark:text-white/30 uppercase tracking-widest mb-2 px-1">
                Keterangan
              </label>
              <input
                className="w-full bg-surface-container-lowest dark:bg-dark border-none ring-1 ring-on-surface/10 dark:ring-white/10 focus:ring-2 focus:ring-accent rounded-2xl p-4 text-on-surface dark:text-white placeholder:text-on-surface/30 dark:placeholder:text-white/20 transition-all outline-none"
                placeholder="Contoh: Makan siang bakso, dll. (Opsional)"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-on-surface/40 dark:text-white/30 uppercase tracking-widest mb-2 px-1">
                Tanggal
              </label>
              <div className="relative">
                <input
                  className={`w-full bg-surface-container-lowest dark:bg-dark border-none ring-1 ${
                    errors.date ? "ring-danger" : "ring-on-surface/10 dark:ring-white/10"
                  } focus:ring-2 focus:ring-accent rounded-2xl p-4 text-on-surface dark:text-white transition-all outline-none [color-scheme:light] dark:[color-scheme:dark]`}
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value)
                    if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }))
                  }}
                  aria-invalid={!!errors.date}
                />
              </div>
              {errors.date && (
                <p className="text-danger text-xs mt-1.5 px-1 font-medium">{errors.date}</p>
              )}
            </div>
          </div>

          <button
            className="w-full bg-accent text-on-primary-fixed font-black py-5 rounded-2xl hover:brightness-105 dark:hover:brightness-110 transition-all duration-300 transform active:scale-95 shadow-lg hover:shadow-accent/40 flex items-center justify-center gap-2 group cursor-pointer"
            onClick={handleSave}
            type="button"
          >
            <svg
              className="h-6 w-6 group-hover:rotate-90 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
            </svg>
            Simpan Transaksi
          </button>
        </form>
      </div>
    </section>
  )
}
