import type React from "react"
import type { Metadata } from "next"
import { M_PLUS_Rounded_1c } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthStatus } from "@/components/auth-status"

const mPlusRounded = M_PLUS_Rounded_1c({ 
  subsets: ["latin", "latin-ext"],
  weight: ["100", "300", "400", "500", "700", "800", "900"],
  display: 'swap',
  variable: '--font-m-plus-rounded',
  preload: true,
  adjustFontFallback: true
})

export const metadata: Metadata = {
  title: "マネー管理 - マネー卍会",
  description: "中高生が楽しく・簡単にお金を管理し、節約の意識を持てるアプリ",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${mPlusRounded.variable} font-sans`} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthStatus />
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}