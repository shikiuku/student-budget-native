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
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/login')
          return
        }

        if (data.session) {
          const user = data.session.user
          
          // Check if user profile exists
          const profileResult = await userProfileService.getProfile(user.id)
          
          if (profileResult.success && profileResult.data) {
            // Profile exists, redirect to dashboard
            router.push('/')
          } else {
            // No profile, redirect to onboarding
            router.push('/onboarding')
          }
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/login')
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