"use client"

export function FloatingActionButton() {
  return (
    <div className="fixed max-sm:bottom-4 bottom-6 right-6 lg:hidden z-50" data-purpose="mobile-fab">
      <button
        className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-2xl shadow-accent/50 animate-float-ui text-on-primary-fixed hover:scale-105 active:scale-95 transition-transform duration-300 cursor-pointer"
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
    </div>
  )
}
