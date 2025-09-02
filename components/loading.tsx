import React from "react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "small" | "medium" | "large"
  message?: string
  className?: string
}

export function Loading({ size = "medium", message, className }: LoadingProps) {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12", 
    large: "w-16 h-16"
  }

  return (
    <div className={cn("text-center py-8", className)}>
      <div className="flex justify-center mb-4">
        <svg 
          className={cn(sizeClasses[size])}
          viewBox="0 0 120 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 中央の円 */}
          <circle cx="60" cy="60" r="20" fill="#60A5FA" />
          
          {/* 周りの小さな形 */}
          <circle cx="60" cy="30" r="6" fill="#FED7AA" />
          <rect x="84" y="54" width="12" height="12" fill="#BBF7D0" />
          <circle cx="60" cy="90" r="6" fill="#FBBF24" />
          <polygon points="36,66 30,78 42,78" fill="#C7D2FE" />
          
          {/* アクセント */}
          <circle cx="60" cy="60" r="8" fill="#3B82F6" />
          <circle cx="60" cy="60" r="3" fill="white" />
        </svg>
      </div>
      {message && (
        <p className="text-gray-600">{message}</p>
      )}
    </div>
  )
}

// 全画面ローディング
export function FullScreenLoading({ message = "読み込み中..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center pb-20">
      <Loading size="large" message={message} />
    </div>
  )
}

// 認証ローディング
export function AuthLoading() {
  return <FullScreenLoading message="認証状態を確認中..." />
}

// データローディング
export function DataLoading() {
  return <FullScreenLoading message="データを読み込み中..." />
}

// プロフィールローディング
export function ProfileLoading() {
  return <FullScreenLoading message="プロフィール情報を読み込み中..." />
}

// 小さなインラインローディング
export function InlineLoading({ message = "読み込み中..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-4">
      <Loading size="small" message={message} />
    </div>
  )
}