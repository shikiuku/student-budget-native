"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

const clearAuthSession = async () => {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
    // ローカルストレージからSupabase関連データを削除
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('sb-') && key.includes('-auth-token')) {
          localStorage.removeItem(key)
        }
      })
    }
  } catch (error) {
    console.error('セッションクリアエラー:', error)
  }
}
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    const getSession = async () => {
      console.log('認証セッション取得開始');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('認証セッション取得結果:', { session: !!session, error });
        
        if (error) {
          console.error('認証セッション取得エラー:', error);
          // リフレッシュトークンエラーの場合は完全なセッションクリア
          if (error.message?.includes('Refresh Token') || error.message?.includes('Invalid Refresh Token')) {
            console.log('無効なリフレッシュトークンを検出、セッションをクリアします');
            await clearAuthSession();
            setUser(null);
            setLoading(false);
            return;
          }
        }
        
        // セッションが存在する場合のみユーザーを設定
        if (session && session.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
        console.log('認証loading状態をfalseに設定');
      } catch (err) {
        console.error('認証セッション取得で例外発生:', err);
        setUser(null);
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('認証状態変更:', { event, session: !!session });
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('トークンがリフレッシュされました');
        } else if (event === 'SIGNED_IN') {
          console.log('サインインしました');
        } else if (event === 'SIGNED_OUT') {
          console.log('サインアウトしました');
        }
        
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
