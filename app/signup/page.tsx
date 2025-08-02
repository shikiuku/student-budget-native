"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !confirmPassword) return

    if (password !== confirmPassword) {
      toast({
        title: "パスワードエラー",
        description: "パスワードが一致しません。",
        variant: "destructive",
      })
      return
    }

    if (!agreedToTerms) {
      toast({
        title: "利用規約への同意が必要です",
        description: "利用規約とプライバシーポリシーに同意してください。",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      toast({
        title: "新規登録成功",
        description: "確認メールを送信しました。メールをご確認ください。",
      })

      // If email confirmation is disabled, redirect to onboarding
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "メール確認",
          description: "メールアドレスの確認が完了したら、オンボーディングを開始できます。",
        })
      } else {
        router.push("/onboarding")
      }
    } catch (error) {
      toast({
        title: "新規登録エラー",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    if (!agreedToTerms) {
      toast({
        title: "利用規約への同意が必要です",
        description: "利用規約とプライバシーポリシーに同意してください。",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (error) {
      toast({
        title: "Googleサインアップエラー",
        description: (error as Error).message,
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-black">新規登録</h1>
          <p className="text-gray-600">アカウントを作成して始めましょう</p>
        </div>

        <div className="space-y-4 bg-white border border-gray-200 rounded-lg p-6">
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-black">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@student.ac.jp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-white text-black border-gray-300 focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-black">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 bg-white text-black border-gray-300 focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400"
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-black">パスワード確認</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 bg-white text-black border-gray-300 focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400"
                required
                minLength={6}
              />
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 rounded border-gray-300 bg-white text-zaim-blue-600 focus:ring-zaim-blue-400 focus:bg-white checked:bg-zaim-blue-600 checked:border-zaim-blue-600"
              />
              <Label htmlFor="terms" className="text-sm text-gray-700">
                <Link href="#" className="text-zaim-blue-600 hover:text-zaim-blue-700 underline">利用規約</Link>
                と
                <Link href="#" className="text-zaim-blue-600 hover:text-zaim-blue-700 underline">プライバシーポリシー</Link>
                に同意します
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white px-6"
              disabled={loading}
            >
              {loading ? "新規登録中..." : "新規登録"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">または</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleGoogleSignup}
              className="w-full border border-gray-300 bg-white text-black hover:bg-gray-50"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Googleで新規登録
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              すでにアカウントをお持ちの場合は{" "}
              <Link href="/login" className="text-zaim-blue-600 hover:text-zaim-blue-700 underline">
                ログイン
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}