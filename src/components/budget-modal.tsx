"use client"

import { useState } from "react"
import { useBudgetStore } from "@/hooks/use-budget-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UtensilsCrossed, Gamepad2, Car, Shield, TrendingUp, Receipt, Repeat, MoreHorizontal, Briefcase, Zap } from "lucide-react"

const ALL_CATEGORIES = ["Makanan", "Hiburan", "Transportasi", "Asuransi", "Investasi", "Tagihan", "Subscription", "Gaji", "Side Income", "Lainnya"]

const CATEGORY_COLORS: Record<string, { icon: React.ReactNode; bg: string; fg: string }> = {
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

interface BudgetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BudgetModal({ open, onOpenChange }: BudgetModalProps) {
  const { budgets, setBudget } = useBudgetStore()
  const [edits, setEdits] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const cat of ALL_CATEGORIES) {
      initial[cat] = budgets[cat] ? budgets[cat].toString() : ""
    }
    return initial
  })

  const handleSave = () => {
    for (const cat of ALL_CATEGORIES) {
      const val = edits[cat]?.replace(/[^0-9]/g, "")
      setBudget(cat, val ? parseInt(val, 10) : 0)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atur Budget Bulanan</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {ALL_CATEGORIES.map((cat) => {
            const c = CATEGORY_COLORS[cat]
            return (
              <div key={cat} className="flex items-center gap-3 bg-surface-container-low dark:bg-white/[0.03] rounded-2xl p-4 border border-on-surface/5 dark:border-white/5">
                <div className={`w-8 h-8 rounded-xl ${c.bg} ${c.fg} flex items-center justify-center flex-shrink-0`}>
                  {c.icon}
                </div>
                <span className="flex-1 text-sm font-bold text-on-surface dark:text-white">{cat}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-on-surface/30 dark:text-white/30 font-medium">Rp</span>
                  <input
                    className="w-28 bg-surface-container-lowest dark:bg-dark border-none ring-1 ring-on-surface/10 dark:ring-white/10 focus:ring-2 focus:ring-accent rounded-xl py-2 px-3 text-sm text-on-surface dark:text-white text-right outline-none transition-all"
                    placeholder="0"
                    type="text"
                    inputMode="numeric"
                    value={edits[cat]}
                    onChange={(e) => setEdits((prev) => ({ ...prev, [cat]: e.target.value.replace(/[^0-9]/g, "") }))}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex gap-3 pt-2">
          <button
            className="flex-1 bg-accent text-on-primary-fixed font-black py-4 rounded-2xl hover:brightness-105 dark:hover:brightness-110 transition-all duration-300 transform active:scale-95 shadow-lg hover:shadow-accent/40 cursor-pointer"
            onClick={handleSave}
          >
            Simpan Budget
          </button>
          <button
            className="flex-1 border border-on-surface/10 dark:border-white/10 text-on-surface dark:text-white font-medium py-4 rounded-2xl hover:bg-on-surface/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
