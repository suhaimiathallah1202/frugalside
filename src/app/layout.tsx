import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/toast-provider";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { FinanceProvider } from "@/hooks/use-finance-store";
import { BudgetProvider } from "@/hooks/use-budget-store";
import { RecurringProvider } from "@/hooks/use-recurring-store";
import { SettingsProvider } from "@/hooks/use-settings-store";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "FrugalSide: Aplikasi Pencatatan Uang untuk Gen Z",
  description: "FrugalSide adalah aplikasi pencatatan uang untuk Gen Z yang dirancang khusus untuk membantu Anda mengelola keuangan dengan mudah dan menyenangkan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
            <FinanceProvider>
              <BudgetProvider>
                <RecurringProvider>
                  {children}
                  <ToastProvider />
                  <OnboardingFlow />
                </RecurringProvider>
              </BudgetProvider>
            </FinanceProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
