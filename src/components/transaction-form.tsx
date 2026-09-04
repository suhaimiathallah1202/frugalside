"use client"

import { useState, useEffect } from "react"
import { useFinanceStore } from "@/hooks/use-finance-store"
import { useRecurringStore } from "@/hooks/use-recurring-store"
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
  UtensilsCrossed,
  Gamepad2,
  Car,
  Shield,
  TrendingUp,
  Receipt,
  Repeat,
  MoreHorizontal,
  Briefcase,
  Zap,
} from "lucide-react"

type CategoryStyle = {
  icon: React.ReactNode
  bg: string
  fg: string
}

const CATEGORY_STYLE: Record<string, CategoryStyle> = {
  Makanan: {
    icon: <UtensilsCrossed className="h-3.5 w-3.5" />,
    bg: "bg-orange-100 dark:bg-orange-500/20",
    fg: "text-orange-600 dark:text-orange-400",
  },
  Hiburan: {
    icon: <Gamepad2 className="h-3.5 w-3.5" />,
    bg: "bg-purple-100 dark:bg-purple-500/20",
    fg: "text-purple-600 dark:text-purple-400",
  },
  Transportasi: {
    icon: <Car className="h-3.5 w-3.5" />,
    bg: "bg-blue-100 dark:bg-blue-500/20",
    fg: "text-blue-600 dark:text-blue-400",
  },
  Asuransi: {
    icon: <Shield className="h-3.5 w-3.5" />,
    bg: "bg-teal-100 dark:bg-teal-500/20",
    fg: "text-teal-600 dark:text-teal-400",
  },
  Investasi: {
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    bg: "bg-emerald-100 dark:bg-emerald-500/20",
    fg: "text-emerald-600 dark:text-emerald-400",
  },
  Tagihan: {
    icon: <Receipt className="h-3.5 w-3.5" />,
    bg: "bg-rose-100 dark:bg-rose-500/20",
    fg: "text-rose-600 dark:text-rose-400",
  },
  Subscription: {
    icon: <Repeat className="h-3.5 w-3.5" />,
    bg: "bg-indigo-100 dark:bg-indigo-500/20",
    fg: "text-indigo-600 dark:text-indigo-400",
  },
  Gaji: {
    icon: <Briefcase className="h-3.5 w-3.5" />,
    bg: "bg-amber-100 dark:bg-amber-500/20",
    fg: "text-amber-600 dark:text-amber-400",
  },
  "Side Income": {
    icon: <Zap className="h-3.5 w-3.5" />,
    bg: "bg-cyan-100 dark:bg-cyan-500/20",
    fg: "text-cyan-600 dark:text-cyan-400",
  },
  Lainnya: {
    icon: <MoreHorizontal className="h-3.5 w-3.5" />,
    bg: "bg-gray-100 dark:bg-gray-500/20",
    fg: "text-gray-600 dark:text-gray-400",
  },
}

export function CategoryIcon({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const cfg = CATEGORY_STYLE[name]
  if (!cfg) return null
  const dim = size === "sm" ? "w-6 h-6 rounded-md" : "w-7 h-7 rounded-lg"
  return (
    <div className={`${dim} ${cfg.bg} ${cfg.fg} flex items-center justify-center flex-shrink-0`}>
      {cfg.icon}
    </div>
  )
}

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
  const { addTransaction, getBalance } = useFinanceStore()
  const { addRecurring } = useRecurringStore()

  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense")
  const [errors, setErrors] = useState<Errors>({})
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("monthly")

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
    if (activeTab === "expense" && numAmount > 0) {
      const balance = getBalance()
      if (numAmount > balance) {
        newErrors.amount = "Pengeluaran melebihi saldo! Saldo kamu: Rp" + balance.toLocaleString("id-ID")
      }
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

    if (isRecurring) {
      addRecurring({
        type: activeTab,
        amount: numAmount,
        category,
        description: description.trim() || undefined,
        frequency,
        enabled: true,
      })
    }

    toast.success(
      activeTab === "expense" ? "Pengeluaran berhasil dicatat" : "Pemasukan berhasil dicatat"
    )

    setAmount("")
    setDescription("")
    setCategory(categories[0])
    setDate(new Date().toISOString().split("T")[0])
    setIsRecurring(false)
    setFrequency("monthly")
    setErrors({})
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "")
    if (raw) {
      setAmount(parseInt(raw, 10).toLocaleString("id-ID"))
    } else {
      setAmount("")
    }
    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }))
  }

  const handleAmountFocus = () => {
    setAmount(amount.replace(/[^0-9]/g, ""))
  }

  return (
    <section className="lg:col-span-5 space-y-6" data-purpose="transaction-input">
      <div className="bg-card border border-on-surface/5 dark:border-white/5 max-sm:p-5 p-8 rounded-3xl h-full shadow-lg dark:shadow-2xl">
        <div className="flex items-center justify-between max-sm:mb-5 mb-8">
          <h3 className="text-xl font-bold flex items-center gap-2 text-on-surface dark:text-white">
            <span className="w-1.5 h-6 bg-accent rounded-full" />
            Catat Transaksi
          </h3>
        </div>

        <form className="max-sm:space-y-4 space-y-6" onSubmit={(e) => e.preventDefault()} onKeyDown={handleKeyDown}>
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
                onChange={handleAmountChange}
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
                <SelectContent className="bg-card border border-on-surface/5 dark:border-white/5 shadow-xl text-on-surface dark:text-white">
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="rounded-xl focus:bg-accent focus:text-black cursor-pointer py-3"
                    >
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
                placeholder={activeTab === "expense" ? "Contoh: Makan siang bakso, dll. (Opsional)" : "Bonus, THR, dll. (Opsional)"}
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

          <div className="flex items-center gap-3 bg-surface-container-low dark:bg-white/[0.03] rounded-2xl p-4 border border-on-surface/5 dark:border-white/5">
            <button
              className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 cursor-pointer ${
                isRecurring ? "bg-accent" : "bg-on-surface/20 dark:bg-white/20"
              }`}
              onClick={() => setIsRecurring(!isRecurring)}
              role="switch"
              aria-checked={isRecurring}
              aria-label="Ulangi transaksi"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  isRecurring ? "translate-x-5" : ""
                }`}
              />
            </button>
            <div className="flex items-center gap-2 flex-1">
              <Repeat className={`h-4 w-4 ${isRecurring ? "text-accent" : "text-on-surface/30 dark:text-white/30"}`} />
              <label className="text-sm font-bold text-on-surface dark:text-white cursor-pointer flex-1" onClick={() => setIsRecurring(!isRecurring)}>
                Ulangi Transaksi
              </label>
            </div>
            {isRecurring && (
              <select
                className="bg-surface-container-lowest dark:bg-dark border-none ring-1 ring-on-surface/10 dark:ring-white/10 rounded-xl px-3 py-2 text-xs font-medium text-on-surface dark:text-white outline-none cursor-pointer"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as "weekly" | "monthly")}
              >
                <option value="monthly">Bulanan</option>
                <option value="weekly">Mingguan</option>
              </select>
            )}
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
