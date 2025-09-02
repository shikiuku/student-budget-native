"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { AuthModal } from "@/components/auth-modal";

export function AuthStatus() {
  const { user, loading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleSignInClick = () => {
    setAuthMode('signin');
    setIsModalOpen(true);
  };

  const handleSignUpClick = () => {
    setAuthMode('signup');
    setIsModalOpen(true);
  };

  const handleLogOut = async () => {
    await supabase.auth.signOut();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleModeChange = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <img 
            src="/favicon.png" 
            alt="学生向け節約アプリ" 
            className="w-24 h-24 animate-pulse mb-4"
          />
          <p className="text-gray-600 text-lg">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!user && (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <Button 
            onClick={handleSignInClick}
            className="rounded-full bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white px-6"
          >
            ログイン
          </Button>
          <Button 
            onClick={handleSignUpClick}
            className="rounded-full bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white px-6"
          >
            新規登録
          </Button>
        </div>
      )}

      <AuthModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={authMode}
        onModeChange={handleModeChange}
      />
    </>
  );
}
