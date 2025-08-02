"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
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
    const getSession = async () => {
      console.log('認証セッション取得開始');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('認証セッション取得結果:', { session: !!session, error });
        
        if (error) {
          console.error('認証セッション取得エラー:', error);
        }
        
        setUser(session?.user ?? null);
        setLoading(false);
        console.log('認証loading状態をfalseに設定');
      } catch (err) {
        console.error('認証セッション取得で例外発生:', err);
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('認証状態変更:', { event, session: !!session });
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
