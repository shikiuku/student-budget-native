"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
}

export function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      // 本番環境とローカル環境を自動判定
      const redirectUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/auth/callback'
        : `${window.location.origin}/auth/callback`;
      
      console.log('Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error('Google認証エラー:', error);
        alert('Google認証に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('認証エラー:', error);
      alert('認証処理中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        // バリデーション
        if (!email || !password) {
          alert('メールアドレスとパスワードを入力してください');
          return;
        }
        if (password.length < 6) {
          alert('パスワードは6文字以上で入力してください');
          return;
        }
        if (password !== confirmPassword) {
          alert('パスワードが一致しません');
          return;
        }
        if (!termsAccepted) {
          alert('利用規約とプライバシーポリシーに同意してください');
          return;
        }
        
        // リダイレクトURLを設定
        const redirectUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:3000/auth/callback'
          : `${window.location.origin}/auth/callback`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          }
        });
        
        if (error) {
          // エラーメッセージを日本語化
          let errorMessage = '新規登録に失敗しました';
          if (error.message.includes('already registered')) {
            errorMessage = 'このメールアドレスは既に登録されています';
          } else if (error.message.includes('invalid email')) {
            errorMessage = '有効なメールアドレスを入力してください';
          } else if (error.message.includes('password')) {
            errorMessage = 'パスワードが無効です（6文字以上の英数字）';
          }
          alert(errorMessage);
        } else {
          alert('確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。');
          // メールと入力フィールドをクリア
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setTermsAccepted(false);
          onClose();
        }
      } else {
        // ログイン処理
        if (!email || !password) {
          alert('メールアドレスとパスワードを入力してください');
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          // エラーメッセージを日本語化
          let errorMessage = 'ログインに失敗しました';
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'メールアドレスまたはパスワードが間違っています';
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'メールアドレスが確認されていません。確認メールをご確認ください。';
          } else if (error.message.includes('invalid email')) {
            errorMessage = '有効なメールアドレスを入力してください';
          }
          alert(errorMessage);
        } else {
          // ログイン成功
          setEmail('');
          setPassword('');
          onClose();
        }
      }
    } catch (error) {
      console.error('認証エラー:', error);
      alert('認証処理中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-black text-center">
            {mode === 'signin' ? 'ログイン' : '新規登録'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">メールアドレス</label>
              <input
                type="email"
                placeholder="example@student.ac.jp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black mb-2">パスワード</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
                required
              />
            </div>
            
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">パスワード確認</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black"
                    required
                  />
                </div>
                
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 rounded border-gray-300 bg-white text-zaim-blue-600 focus:ring-zaim-blue-400 focus:bg-white checked:bg-zaim-blue-600 checked:border-zaim-blue-600"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    <a href="#" className="text-zaim-blue-600 hover:text-zaim-blue-700 underline">利用規約</a>
                    と
                    <a href="#" className="text-zaim-blue-600 hover:text-zaim-blue-700 underline">プライバシーポリシー</a>
                    に同意します
                  </label>
                </div>
              </>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white"
              disabled={loading}
            >
              {mode === 'signin' ? 'ログイン' : '新規登録'}
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

          <div>
            <Button 
              onClick={handleGoogleAuth}
              className="w-full border border-gray-300 bg-white text-black hover:bg-gray-50"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google{mode === 'signin' ? 'でログイン' : 'で新規登録'}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {mode === 'signin' ? (
                <>
                  アカウントをお持ちでない場合は{" "}
                  <button 
                    onClick={() => onModeChange('signup')}
                    className="text-zaim-blue-600 hover:text-zaim-blue-700 underline"
                  >
                    新規登録
                  </button>
                </>
              ) : (
                <>
                  すでにアカウントをお持ちの場合は{" "}
                  <button 
                    onClick={() => onModeChange('signin')}
                    className="text-zaim-blue-600 hover:text-zaim-blue-700 underline"
                  >
                    ログイン
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}