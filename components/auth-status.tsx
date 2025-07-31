"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import React from "react"

export function AuthStatus() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <div className="absolute top-4 right-4">
      {user ? (
        <Button onClick={handleSignOut}>ログアウト</Button>
      ) : (
        <Button onClick={() => router.push("/login")}>ログイン</Button>
      )}
    </div>
  );
}
