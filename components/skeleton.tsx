import React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-md bg-gray-200", className)} />
  )
}

// 支出カード用のスケルトン
export function ExpenseCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* カテゴリアイコン */}
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              {/* 金額 */}
              <Skeleton className="h-6 w-20" />
              {/* カテゴリバッジ */}
              <Skeleton className="h-5 w-16 rounded-full" />
              {/* PayPayバッジ */}
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            {/* 説明 */}
            <Skeleton className="h-4 w-32 mb-1" />
            {/* 日付 */}
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* 編集・削除ボタン */}
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  )
}

// 投稿カード用のスケルトン
export function PostCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        {/* プロフィール画像 */}
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          {/* ユーザー名と時間 */}
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
          {/* タイトル */}
          <Skeleton className="h-5 w-48 mb-2" />
          {/* 内容 */}
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4 mb-3" />
          {/* カテゴリバッジ */}
          <Skeleton className="h-5 w-16 rounded-full mb-3" />
          {/* いいね・ブックマークボタン */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

// プロフィールカード用のスケルトン
export function ProfileCardSkeleton() {
  return (
    <div className="bg-zaim-blue-50 border border-zaim-blue-500 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-4">
        {/* アバター */}
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1">
          {/* 名前 */}
          <Skeleton className="h-6 w-32 mb-2" />
          {/* 学年 */}
          <Skeleton className="h-4 w-24 mb-2" />
          <div className="flex gap-2">
            {/* バッジ */}
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

// 支出サマリーカード用のスケルトン
export function ExpenseSummarySkeleton() {
  return (
    <div className="bg-zaim-blue-50 border border-zaim-blue-200 rounded-lg p-4">
      <div className="text-center">
        {/* 金額 */}
        <Skeleton className="h-8 w-32 mx-auto mb-2" />
        {/* 説明テキスト */}
        <Skeleton className="h-4 w-24 mx-auto" />
      </div>
    </div>
  )
}

// カテゴリ集計用のスケルトン
export function CategorySummarySkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* カテゴリアイコン */}
              <Skeleton className="w-8 h-8 rounded-full" />
              {/* カテゴリ名 */}
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center gap-2">
              {/* 金額 */}
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 複数の支出カードローディング
export function ExpenseListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ExpenseCardSkeleton key={i} />
      ))}
    </div>
  )
}

// 複数の投稿カードローディング
export function PostListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ホームページ用の予算カードスケルトン
export function BudgetCardSkeleton() {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div>
            <Skeleton className="h-8 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="w-full h-3 rounded-full" />
          </div>
        </div>
        <div className="border-l-2 border-gray-100 pl-6 space-y-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-32 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// ドーナツチャート用のスケルトン
export function DonutChartSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <Skeleton className="h-6 w-16 mb-4" />
      <div className="flex flex-col items-center">
        <Skeleton className="w-48 h-48 rounded-full mb-4" />
        <div className="space-y-1 text-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 収支サマリー用のスケルトン
export function IncomeSummarySkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <Skeleton className="h-4 w-8" />
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}