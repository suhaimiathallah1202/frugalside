"use client"

import { useTheme } from "next-themes"

export function MainHeader() {
  const { theme, setTheme } = useTheme()

  return (
    <header
      className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center"
      data-purpose="site-navigation"
    >
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-tr from-accent to-primary-container rounded-xl flex items-center justify-center font-black text-xl text-on-primary-fixed shadow-lg shadow-accent/20">
          F
        </div>
        <h1 className="text-2xl font-black tracking-tight text-on-surface dark:text-white">
          Frugal<span className="text-accent">Side</span>
        </h1>
      </div>
      <button
        aria-label="Toggle Theme"
        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-card border border-on-surface/5 dark:border-white/5 hover:border-accent/50 transition-all duration-300 shadow-sm dark:shadow-none"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? (
          <svg className="h-6 w-6 text-on-surface/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        ) : (
          <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        )}
      </button>
    </header>
  )
}
