"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider, useAuth } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

function AuthStatus() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <div className="absolute top-4 right-4">
      {user ? (
        <Button onClick={handleSignOut}>ログアウト</Button>
      ) : (
        <Button onClick={() => router.push("/login")}>ログイン</Button>
      )}
    </div>
  );
}

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
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
