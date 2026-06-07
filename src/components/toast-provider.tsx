"use client"

import { Toaster as SonnerToaster } from "sonner"
import { useTheme } from "next-themes"

export function ToastProvider() {
  const { theme } = useTheme()

  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      theme={theme as "light" | "dark" | "system"}
      toastOptions={{
        duration: 3000,
      }}
    />
  )
}
