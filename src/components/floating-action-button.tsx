"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

export function FloatingActionButton() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const button = (
    <button
      className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-on-primary-fixed hover:scale-105 active:scale-95 transition-transform duration-300 cursor-pointer"
      onClick={() => {
        const formEl = document.querySelector('[data-purpose="transaction-input"]')
        formEl?.scrollIntoView({ behavior: "smooth" })
      }}
      aria-label="Tambah Transaksi"
    >
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
      </svg>
    </button>
  )

  if (!mounted) return null

  return createPortal(
    <div className="fixed max-sm:bottom-4 bottom-6 right-6 lg:hidden z-50" data-purpose="mobile-fab">
      {button}
    </div>,
    document.body
  )
}
