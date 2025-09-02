import React from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  className?: string
}

export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      {icon && (
        <div className="mb-4 flex justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
    </div>
  )
}

// プリセットの空状態イラスト付きコンポーネント
export function EmptyPosts() {
  return (
    <EmptyState
      icon={
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="40" fill="#E0F2FE" />
          <path d="M45 50C45 47.2386 47.2386 45 50 45H70C72.7614 45 75 47.2386 75 50V70C75 72.7614 72.7614 75 70 75H50C47.2386 75 45 72.7614 45 70V50Z" fill="#60A5FA" />
          <path d="M52 55H68M52 60H68M52 65H60" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="35" cy="35" r="5" fill="#FED7AA" />
          <circle cx="85" cy="35" r="3" fill="#BBF7D0" />
          <circle cx="35" cy="85" r="3" fill="#FBBF24" />
          <circle cx="85" cy="85" r="5" fill="#C7D2FE" />
        </svg>
      }
      title="まだ投稿がありません"
      description="最初の節約アイディアを投稿してみましょう！"
    />
  )
}

export function EmptyLikes() {
  return (
    <EmptyState
      icon={
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="40" fill="#FEE2E2" />
          <path d="M60 85C60 85 80 70 80 55C80 45 72 40 65 40C62 40 60 42 60 42C60 42 58 40 55 40C48 40 40 45 40 55C40 70 60 85 60 85Z" fill="#EF4444" />
          <circle cx="35" cy="35" r="5" fill="#FED7AA" />
          <circle cx="85" cy="35" r="3" fill="#BBF7D0" />
          <circle cx="35" cy="85" r="3" fill="#FBBF24" />
          <circle cx="85" cy="85" r="5" fill="#C7D2FE" />
          <path d="M50 55L55 60L65 50" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      }
      title="いいねした投稿がありません"
      description="気に入った節約アイディアにいいねしてみましょう！"
    />
  )
}

export function EmptyBookmarks() {
  return (
    <EmptyState
      icon={
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="40" fill="#FEF3C7" />
          <path d="M45 40C45 37.2386 47.2386 35 50 35H70C72.7614 35 75 37.2386 75 40V80L60 70L45 80V40Z" fill="#F59E0B" />
          <circle cx="35" cy="35" r="5" fill="#FED7AA" />
          <circle cx="85" cy="35" r="3" fill="#BBF7D0" />
          <circle cx="35" cy="85" r="3" fill="#A78BFA" />
          <circle cx="85" cy="85" r="5" fill="#C7D2FE" />
          <path d="M55 50H65M55 55H65" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      }
      title="保存した投稿がありません"
      description="後で見返したい投稿を保存してみましょう！"
    />
  )
}

export function EmptyExpenses() {
  return (
    <EmptyState
      icon={
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="40" fill="#E0F2FE" />
          <rect x="45" y="50" width="30" height="20" rx="2" fill="#60A5FA" />
          <circle cx="60" cy="60" r="15" fill="#3B82F6" />
          <path d="M60 52V68M52 60H68" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="35" cy="35" r="5" fill="#FED7AA" />
          <circle cx="85" cy="35" r="3" fill="#BBF7D0" />
          <circle cx="35" cy="85" r="3" fill="#FBBF24" />
          <circle cx="85" cy="85" r="5" fill="#C7D2FE" />
        </svg>
      }
      title="支出データがありません"
      description="今日の支出を記録してみましょう！"
    />
  )
}