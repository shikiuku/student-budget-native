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

  // Supabaseクライアントを作成
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // メール確認リンクからのトークン処理
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // 成功時は初期設定ページにリダイレクト（メール確認成功を示す）
      return NextResponse.redirect(new URL(`/onboarding?email_confirmed=true`, requestUrl.origin))
    } else {
      // エラー時はエラーメッセージと共にリダイレクト
      return NextResponse.redirect(new URL(`/?error=verification_failed`, requestUrl.origin))
    }
  }

  // OAuth認証からのコード処理
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // デフォルトはホームページにリダイレクト
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}