"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true); // true for login, false for signup
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "ログイン成功",
          description: "ホーム画面にリダイレクトします。",
        });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "サインアップ成功",
          description: "アカウントが作成されました。ホーム画面にリダイレクトします。",
        });
      }
      router.push("/"); // Redirect to home page or dashboard
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "認証エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isLogin ? "ログイン" : "サインアップ"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {isLogin ? "ログイン" : "サインアップ"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isLogin ? "アカウントをお持ちでないですか？" : "すでにアカウントをお持ちですか？"}{" "}
            <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "サインアップ" : "ログイン"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
