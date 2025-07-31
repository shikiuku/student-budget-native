"use client"

import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, PlusCircle, BarChart3, Utensils, Car, ShoppingBag, Home, BookOpen, Shirt } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function HomePage() {
  const monthlyBudget = 15000
  const spent = 8500
  const remaining = monthlyBudget - spent
  const spentPercentage = (spent / monthlyBudget) * 100
  
  // カテゴリ別支出データ
  const categories = [
    { name: "食費", amount: 3500, icon: Utensils, color: "#f97316", percentage: 41 },
    { name: "交通費", amount: 2000, icon: Car, color: "#3b82f6", percentage: 24 },
    { name: "娯楽", amount: 2000, icon: ShoppingBag, color: "#a855f7", percentage: 24 },
    { name: "学用品", amount: 500, icon: BookOpen, color: "#22c55e", percentage: 6 },
    { name: "その他", amount: 500, icon: Home, color: "#6b7280", percentage: 5 },
  ]
  
  // Zaim style: 緑=余裕、黄=注意、赤=危険
  const getBudgetStatus = (percentage: number) => {
    if (percentage <= 60) return { color: 'zaim-green-500', bgColor: 'zaim-green-50', borderColor: 'zaim-green-500', status: '余裕あり' }
    if (percentage <= 80) return { color: 'zaim-yellow-500', bgColor: 'zaim-yellow-50', borderColor: 'zaim-yellow-500', status: '注意' }
    return { color: 'zaim-red-500', bgColor: 'zaim-red-50', borderColor: 'zaim-red-500', status: '要注意' }
  }
  
  const budgetStatus = getBudgetStatus(spentPercentage)

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 space-y-6 pt-6">
        {/* Main Budget Display - Updated style */}
        <div 
          className="rounded-lg p-4"
          style={{ 
            backgroundColor: budgetStatus.bgColor === 'zaim-green-50' ? '#f0f9f0' : 
                            budgetStatus.bgColor === 'zaim-yellow-50' ? '#fcfcf0' : '#fcf0f0',
            borderColor: budgetStatus.borderColor === 'zaim-green-500' ? '#5a9c5a' :
                        budgetStatus.borderColor === 'zaim-yellow-500' ? '#cccc5a' : '#cc5a5a',
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
        >
          <div className="text-center space-y-3">
            <div className="flex justify-center items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ 
                  backgroundColor: budgetStatus.color === 'zaim-green-500' ? '#5a9c5a' :
                                  budgetStatus.color === 'zaim-yellow-500' ? '#cccc5a' : '#cc5a5a'
                }}
              ></div>
              <span 
                className="text-sm font-medium"
                style={{ 
                  color: budgetStatus.color === 'zaim-green-500' ? '#5a9c5a' :
                        budgetStatus.color === 'zaim-yellow-500' ? '#cccc5a' : '#cc5a5a'
                }}
              >{budgetStatus.status}</span>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold text-black">¥{remaining.toLocaleString()}</div>
              <div className="text-sm text-gray-600">今月使える金額</div>
            </div>
            
            {/* Budget bar - Zaim style */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>予算 ¥{monthlyBudget.toLocaleString()}</span>
                <span>使用 {spentPercentage.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(spentPercentage, 100)}%`,
                    backgroundColor: budgetStatus.color === 'zaim-green-500' ? '#5a9c5a' :
                                    budgetStatus.color === 'zaim-yellow-500' ? '#cccc5a' : '#cc5a5a'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Income/Expense Summary - Zaim list style */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="text-sm font-medium text-black">収支</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e0f2e0' }}>
                  <TrendingUp className="h-4 w-4" style={{ color: '#5a9c5a' }} />
                </div>
                <span className="text-sm font-medium text-black">収入</span>
              </div>
              <span className="text-sm font-bold text-black">¥15,000</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f9e0e0' }}>
                  <TrendingDown className="h-4 w-4" style={{ color: '#cc5a5a' }} />
                </div>
                <span className="text-sm font-medium text-black">支出</span>
              </div>
              <span className="text-sm font-bold text-black">¥{spent.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Category Chart and List - Updated with Donut Chart */}
        <div className="space-y-6">
          {/* ドーナツチャート（案1） */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-black mb-4">支出内訳</h2>
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="relative w-56 h-56">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                  {/* ドーナツチャートの描画 */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#f97316" strokeWidth="16" 
                    strokeDasharray={`${categories[0].percentage * 5.03} 502.65`} strokeDashoffset="0"/>
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#3b82f6" strokeWidth="16" 
                    strokeDasharray={`${categories[1].percentage * 5.03} 502.65`} strokeDashoffset={`-${categories[0].percentage * 5.03}`}/>
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#a855f7" strokeWidth="16" 
                    strokeDasharray={`${categories[2].percentage * 5.03} 502.65`} strokeDashoffset={`-${(categories[0].percentage + categories[1].percentage) * 5.03}`}/>
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#22c55e" strokeWidth="16" 
                    strokeDasharray={`${categories[3].percentage * 5.03} 502.65`} strokeDashoffset={`-${(categories[0].percentage + categories[1].percentage + categories[2].percentage) * 5.03}`}/>
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#6b7280" strokeWidth="16" 
                    strokeDasharray={`${categories[4].percentage * 5.03} 502.65`} strokeDashoffset={`-${(categories[0].percentage + categories[1].percentage + categories[2].percentage + categories[3].percentage) * 5.03}`}/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">¥{spent.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">合計支出</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.name} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                    <span className="text-sm font-medium text-black w-16">{category.name}</span>
                    <span className="text-sm text-gray-600">{category.percentage}% (¥{category.amount.toLocaleString()})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* カテゴリリスト - Zaim style */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm font-medium text-black">カテゴリ別支出</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <div key={category.name} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: category.color }}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-black">{category.name}</span>
                    </div>
                    <span className="text-sm font-bold text-black">¥{category.amount.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions - Zaim style */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="text-sm font-medium text-black">アクション</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e0f2e0' }}>
                <PlusCircle className="h-4 w-4" style={{ color: '#5a9c5a' }} />
              </div>
              <span className="text-sm font-medium text-black">支出を記録</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f1f5f9' }}>
                <BarChart3 className="h-4 w-4" style={{ color: '#475569' }} />
              </div>
              <span className="text-sm font-medium text-black">レポートを見る</span>
            </button>
          </div>
        </div>
      </div>

      <BottomNav currentPage="home" />
    </div>
  )
}
