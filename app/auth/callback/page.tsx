"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { userProfileService } from '@/lib/database'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URLからパラメータを取得
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        const errorParam = url.searchParams.get('error')
        const errorDescription = url.searchParams.get('error_description')
        
        // エラーパラメータがある場合の処理
        if (errorParam) {
          console.error('Auth error:', errorParam, errorDescription)
          alert('認証に失敗しました。もう一度お試しください。')
          router.push('/')
          return
        }
        
        if (code) {
          console.log('Processing auth code...')
          const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (authError) {
            console.error('Auth exchange error:', authError)
            alert('認証処理に失敗しました。もう一度お試しください。')
            router.push('/')
            return
          }
          
          console.log('Auth exchange successful:', authData.user?.email)
        }
        
        // セッション確認
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/')
          return
        }

        if (data.session) {
          const user = data.session.user
          console.log('User authenticated:', user.email)
          
          // ユーザープロファイルの存在確認
          const profileResult = await userProfileService.getProfile(user.id)
          
          if (profileResult.success && profileResult.data) {
            console.log('Existing profile found, redirecting to dashboard')
            router.push('/')
          } else {
            console.log('No profile found, redirecting to onboarding')
            router.push('/onboarding')
          }
        } else {
          console.log('No session found, redirecting to home')
          router.push('/')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        alert('認証処理中にエラーが発生しました。')
        router.push('/')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zaim-blue-500 mx-auto"></div>
        <p className="text-gray-600">認証処理中...</p>
      </div>
    </div>
  )
}