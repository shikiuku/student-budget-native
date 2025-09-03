'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Code } from "lucide-react"

interface DevAccessGuardProps {
  children: React.ReactNode
}

export function DevAccessGuard({ children }: DevAccessGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 開発環境では自動的に認証をパス
    if (process.env.NODE_ENV === 'development') {
      setIsAuthenticated(true)
      setLoading(false)
      return
    }

    // セッションストレージから認証状態を確認
    const isDevAuthenticated = sessionStorage.getItem('dev-authenticated')
    if (isDevAuthenticated === 'true') {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // 簡単なパスワード認証（実際のプロジェクトではより安全な方法を使用）
    const devPassword = process.env.NEXT_PUBLIC_DEV_PASSWORD || 'money-moment-dev-2025'
    
    if (password === devPassword) {
      setIsAuthenticated(true)
      sessionStorage.setItem('dev-authenticated', 'true')
    } else {
      setError("パスワードが正しくありません")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <Code className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-zaim-blue-500 rounded-lg flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <CardTitle>開発者認証</CardTitle>
            <p className="text-gray-600 text-sm">
              このページは開発者専用です。<br />
              パスワードを入力してアクセスしてください。
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <Label htmlFor="dev-password">開発者パスワード</Label>
                <Input
                  id="dev-password"
                  type="password"
                  placeholder="パスワードを入力"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
              <Button 
                type="submit" 
                className="w-full bg-zaim-blue-500 hover:bg-zaim-blue-600"
              >
                認証
              </Button>
            </form>
            <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
              <p>💡 開発環境では自動的に認証をパスします</p>
              <p>🔒 本番環境では認証が必要です</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}