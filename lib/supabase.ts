import { createClient } from '@supabase/supabase-js'

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// 認証エラー時のセッションクリア関数
export const clearAuthSession = async () => {
  try {
    await supabase.auth.signOut()
    // ローカルストレージからSupabase関連データを削除
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('sb-hvxyvrquvszdwmjoycsj-auth-token')) {
          localStorage.removeItem(key)
        }
      })
    }
  } catch (error) {
    console.error('セッションクリアエラー:', error)
  }
}
