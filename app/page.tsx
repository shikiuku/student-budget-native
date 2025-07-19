"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Wallet, Target, Lightbulb, Gift } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function HomePage() {
  const monthlyBudget = 15000
  const spent = 8500
  const remaining = monthlyBudget - spent
  const spentPercentage = (spent / monthlyBudget) * 100

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">マネー管理</h1>
          <p className="text-gray-600 text-sm">今月の家計をチェック！</p>
        </div>

        {/* Monthly Summary */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-blue-600" />
              今月の収支
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-gray-700 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">収入</span>
                </div>
                <div className="text-xl font-bold text-gray-900">¥15,000</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-gray-700 mb-1">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium">支出</span>
                </div>
                <div className="text-xl font-bold text-gray-900">¥{spent.toLocaleString()}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>予算の使用状況</span>
                <span className="font-medium">{spentPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={spentPercentage} className="h-3" />
              <div className="text-center">
                <span className="text-lg font-bold text-blue-600">残り ¥{remaining.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">カテゴリ別支出</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "食費", amount: 3500, color: "bg-orange-500", percentage: 41 },
                { name: "交通費", amount: 2000, color: "bg-blue-500", percentage: 24 },
                { name: "娯楽", amount: 2000, color: "bg-purple-500", percentage: 24 },
                { name: "その他", amount: 1000, color: "bg-gray-500", percentage: 11 },
              ].map((category) => (
                <div key={category.name} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${category.color}`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm font-bold">¥{category.amount.toLocaleString()}</span>
                    </div>
                    <Progress value={category.percentage} className="h-2 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Savings Tips */}
        <Card className="bg-blue-50 border border-blue-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              今日の節約アドバイス
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-white/60 rounded-lg">
                <p className="text-sm font-medium text-gray-800">お弁当を作ると月3,000円節約できるよ！</p>
              </div>
              <div className="p-3 bg-white/60 rounded-lg">
                <p className="text-sm font-medium text-gray-800">自転車通学で交通費を半分に削減しよう</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-white">
            <div className="text-center">
              <Target className="h-6 w-6 mx-auto mb-1" />
              <div className="text-sm font-medium">目標設定</div>
            </div>
          </Button>
          <Button className="h-16 bg-gray-600 hover:bg-gray-700 text-white">
            <div className="text-center">
              <Gift className="h-6 w-6 mx-auto mb-1" />
              <div className="text-sm font-medium">補助金チェック</div>
            </div>
          </Button>
        </div>
      </div>

      <BottomNav currentPage="home" />
    </div>
  )
}
