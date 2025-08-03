import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const next = requestUrl.searchParams.get('next') ?? '/'
  const code = requestUrl.searchParams.get('code')

  console.log('Auth callback called with:', { token_hash: !!token_hash, type, code: !!code })

  // Supabaseクライアントを作成（Server-side）
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce'
      }
    }
  )

  // メール確認リンクからのトークン処理
  if (token_hash && type) {
    console.log('Processing email verification with token_hash and type:', type)
    
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    console.log('Email verification result:', { user: !!data.user, session: !!data.session, error })

    if (!error && data.session) {
      // セッションが正常に作成された場合、ユーザープロフィールの存在をチェック
      console.log('Email verification successful, checking user profile')
      
      // プロフィールの存在確認
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()
      
      if (profile && !profileError) {
        // プロフィールが存在する場合はホームページへ
        console.log('User profile exists, redirecting to home')
        return NextResponse.redirect(new URL(`/?email_confirmed=true`, requestUrl.origin))
      } else {
        // プロフィールが存在しない場合はonboardingページへ
        console.log('User profile not found, redirecting to onboarding')
        return NextResponse.redirect(new URL(`/onboarding?email_confirmed=true`, requestUrl.origin))
      }
    } else {
      // エラー時はエラーメッセージと共にリダイレクト
      console.error('Email verification failed:', error)
      return NextResponse.redirect(new URL(`/?error=verification_failed&message=${encodeURIComponent(error?.message || 'Unknown error')}`, requestUrl.origin))
    }
  }

  // OAuth認証からのコード処理
  if (code) {
    console.log('Processing OAuth code exchange')
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('OAuth code exchange result:', { user: !!data.user, session: !!data.session, error })
    
    if (!error && data.session) {
      console.log('OAuth successful, redirecting to:', next)
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } else {
      console.error('OAuth failed:', error)
      return NextResponse.redirect(new URL(`/?error=oauth_failed&message=${encodeURIComponent(error?.message || 'Unknown error')}`, requestUrl.origin))
    }
  }

  // パラメータがない場合のデフォルト処理
  console.log('No auth parameters found, redirecting to home')
  return NextResponse.redirect(new URL('/?error=no_auth_params', requestUrl.origin))
}