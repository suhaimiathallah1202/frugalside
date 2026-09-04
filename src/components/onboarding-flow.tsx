"use client"

import { useState, useEffect } from "react"

const STORAGE_KEY = "duitku-onboarding-v1"

const steps = [
  {
    emoji: "👋",
    title: "Halo! Selamat Datang di FrugalSide!",
    desc: "Aplikasi keuangan yang bikin kamu makin melek duit. Catat, pantau, dan kendalikan pengeluaranmu dengan mudah!",
  },
  {
    emoji: "✍️",
    title: "Catat Transaksi",
    desc: "Tambahkan pemasukan dan pengeluaran dalam hitungan detik. Pilih kategori, isi nominal, dan catat — udah, gampang banget!",
  },
  {
    emoji: "🎯",
    title: "Atur Budget Bulanan",
    desc: "Pasang limit per kategori biar gak boncos tiap bulan. FrugalSide bakal kasih tau kalo kamu udah mendekati batas!",
  },
  {
    emoji: "📊",
    title: "Lihat Visualisasi",
    desc: "Dashboard interaktif dengan grafik pie, bar, dan line. Pantau tren pengeluaran dan saldo bulanan dengan jelas.",
  },
  {
    emoji: "🚀",
    title: "Siap Mulai?",
    desc: "Yuk atur keuanganmu sekarang juga. Ingat: bukan soal seberapa besar penghasilanmu, tapi bagaimana kamu mengelolanya!",
  },
]

export function OnboardingFlow() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!done) setOpen(true)
  }, [])

  function complete() {
    localStorage.setItem(STORAGE_KEY, "true")
    setOpen(false)
  }

  function skip() {
    complete()
  }

  if (!open) return null

  const s = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4">
      <div className="bg-card rounded-3xl shadow-2xl ring-1 ring-foreground/10 max-w-md w-full p-8 md:p-10 relative overflow-hidden">
        <button
          onClick={skip}
          className="absolute top-4 right-4 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1 rounded-full hover:bg-muted"
        >
          Skip
        </button>

        <div className="flex flex-col items-center text-center gap-6 pt-4">
          <span className="text-7xl animate-float-ui">{s.emoji}</span>

          <h2 className="text-2xl font-bold text-foreground leading-tight">
            {s.title}
          </h2>

          <p className="text-muted-foreground leading-relaxed max-w-sm">
            {s.desc}
          </p>

          <div className="flex gap-2 mt-2">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`block h-2 rounded-full transition-all duration-300 ${
                  i === step ? "w-8 bg-accent" : "w-2 bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3 w-full mt-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 px-6 py-3 rounded-2xl border border-border text-foreground font-semibold hover:bg-muted transition-all cursor-pointer"
              >
                Kembali
              </button>
            )}
            <button
              onClick={() => (isLast ? complete() : setStep(step + 1))}
              className="flex-1 px-6 py-3 rounded-2xl bg-accent text-accent-foreground font-bold hover:brightness-110 transition-all cursor-pointer"
            >
              {isLast ? "Mulai!" : "Lanjut"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
