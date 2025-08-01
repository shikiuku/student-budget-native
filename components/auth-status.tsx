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
    return null;
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {user ? (
          <Button 
            onClick={handleLogOut}
            className="rounded-full bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white px-6"
          >
            ログアウト
          </Button>
        ) : (
          <>
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
          </>
        )}
      </div>

      <AuthModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={authMode}
        onModeChange={handleModeChange}
      />
    </>
  );
}
