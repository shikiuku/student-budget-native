import type React from "react"
import type { Metadata } from "next"
import { Inter, Nunito } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthStatus } from "@/components/auth-status"

const inter = Inter({ subsets: ["latin"] })
const nunito = Nunito({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-nunito'
})
// 一時的にローカルフォントを使用

export const metadata: Metadata = {
  title: "マネー管理 - 中高生向け家計管理アプリ",
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
      <body className={`${inter.className} ${nunito.variable}`}>
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