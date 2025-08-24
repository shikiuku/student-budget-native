"use client"

// Student Budget Tracker - Version 2025-08-01 - Complete with Supabase Integration
import { useState, useEffect, Suspense } from "react"
import { useAuth } from "@/components/auth-provider"
import { userProfileService, expenseService, expenseCategoryService } from "@/lib/database"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, PlusCircle, BarChart3, Utensils, Car, ShoppingBag, Home, BookOpen, Shirt, CheckCircle, XCircle } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import type { UserProfile, ExpenseWithCategory, ExpenseCategory } from "@/lib/types"
import { useRouter, useSearchParams } from "next/navigation"

function HomeContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationType, setConfirmationType] = useState<'success' | 'error'>('success')

  const iconMap = {
    "Utensils": Utensils,
    "Car": Car,
    "ShoppingBag": ShoppingBag,
    "BookOpen": BookOpen,
    "Shirt": Home,
    "Home": Home
  }

  // Check for email confirmation status
  useEffect(() => {
    const confirmed = searchParams.get('confirmed')
    const emailConfirmed = searchParams.get('email_confirmed')
    const error = searchParams.get('error')
    
    if (confirmed === 'true' || emailConfirmed === 'true') {
      setConfirmationType('success')
      setShowConfirmation(true)
      // Clear URL params
      router.replace('/')
      setTimeout(() => setShowConfirmation(false), 5000)
    } else if (error === 'verification_failed') {
      setConfirmationType('error')
      setShowConfirmation(true)
      // Clear URL params
      router.replace('/')
      setTimeout(() => setShowConfirmation(false), 5000)
    }
  }, [searchParams, router])

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    setDataLoading(true)
    try {
      // Load user profile
      const profileResult = await userProfileService.getProfile(user.id)
      if (profileResult.success && profileResult.data) {
        setUserProfile(profileResult.data)
      }

      // Load categories
      const categoriesResult = await expenseCategoryService.getCategories()
      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data)
      }

      // Load current month expenses
      const now = new Date()
      const expensesResult = await expenseService.getExpensesByMonth(user.id, now.getFullYear(), now.getMonth() + 1)
      if (expensesResult.success && expensesResult.data) {
        setExpenses(expensesResult.data)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  // Calculate budget and spending data
  const monthlyBudget = userProfile?.monthly_budget || 15000
  const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const remaining = monthlyBudget - spent
  const spentPercentage = monthlyBudget > 0 ? (spent / monthlyBudget) * 100 : 0

  // Calculate category breakdown
  const categoryBreakdown = categories.map(category => {
    const categoryExpenses = expenses.filter(exp => exp.category_id === category.id)
    const amount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    const percentage = spent > 0 ? Math.round((amount / spent) * 100) : 0
    const IconComponent = category.icon ? iconMap[category.icon as keyof typeof iconMap] || Home : Home
    
    return {
      name: category.name,
      amount,
      icon: IconComponent,
      color: category.color || "#6b7280",
      percentage
    }
  }).filter(cat => cat.amount > 0) // Only show categories with expenses
  
  // Zaim style: 緑=余裕、黄=注意、赤=危険
  const getBudgetStatus = (percentage: number) => {
    if (percentage <= 60) return { color: 'zaim-green-500', bgColor: 'zaim-green-50', borderColor: 'zaim-green-500', status: '余裕あり' }
    if (percentage <= 80) return { color: 'zaim-yellow-500', bgColor: 'zaim-yellow-50', borderColor: 'zaim-yellow-500', status: '注意' }
    return { color: 'zaim-red-500', bgColor: 'zaim-red-50', borderColor: 'zaim-red-500', status: '要注意' }
  }
  
  const budgetStatus = getBudgetStatus(spentPercentage)

  // Wait for auth loading to complete first
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pb-20">
        <div className="text-center space-y-4">
          <img 
            src="/logo.png" 
            alt="家計簿アプリロゴ" 
            className="w-16 h-16 mx-auto animate-pulse"
          />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zaim-blue-500 mx-auto"></div>
          <p className="text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pb-20">
        <div className="text-center space-y-4">
          <img 
            src="/logo.png" 
            alt="家計簿アプリロゴ" 
            className="w-20 h-20 mx-auto mb-4"
          />
          <p className="text-gray-600 mb-4">ログインが必要です</p>
          <button 
            onClick={() => router.push('/login')}
            className="bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white px-6 py-2 rounded-full"
          >
            ログイン
          </button>
        </div>
      </div>
    )
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pb-20">
        <div className="text-center space-y-4">
          <img 
            src="/logo.png" 
            alt="家計簿アプリロゴ" 
            className="w-16 h-16 mx-auto animate-pulse"
          />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zaim-blue-500 mx-auto"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  // If user has no profile, redirect to onboarding
  if (!userProfile) {
    router.push('/onboarding')
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pb-20">
        <div className="text-center space-y-4">
          <img 
            src="/logo.png" 
            alt="家計簿アプリロゴ" 
            className="w-16 h-16 mx-auto animate-pulse"
          />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zaim-blue-500 mx-auto"></div>
          <p className="text-gray-600">初期設定にリダイレクト中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Email confirmation notification */}
      {showConfirmation && (
        <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          confirmationType === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-center gap-3">
            {confirmationType === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <div>
              <div className="font-medium">
                {confirmationType === 'success' 
                  ? 'メール認証完了！' 
                  : 'メール認証に失敗しました'
                }
              </div>
              <div className="text-sm">
                {confirmationType === 'success' 
                  ? 'アカウントが有効化されました。ログインできます。' 
                  : '確認リンクが無効または期限切れです。再度お試しください。'
                }
              </div>
            </div>
            <button 
              onClick={() => setShowConfirmation(false)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="px-6 py-4 space-y-6 pt-6">
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
              {userProfile?.name && (
                <div className="text-xs text-gray-500">{userProfile.name}さんの予算</div>
              )}
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
              <span className="text-sm font-bold text-black">¥{monthlyBudget.toLocaleString()}</span>
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
                  {categoryBreakdown.map((category, index) => {
                    const prevPercentage = categoryBreakdown.slice(0, index).reduce((sum, cat) => sum + cat.percentage, 0)
                    return (
                      <circle 
                        key={category.name}
                        cx="100" 
                        cy="100" 
                        r="80" 
                        fill="none" 
                        stroke={category.color} 
                        strokeWidth="16" 
                        strokeDasharray={`${category.percentage * 5.03} 502.65`} 
                        strokeDashoffset={`-${prevPercentage * 5.03}`}
                      />
                    )
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">¥{spent.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">合計支出</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {categoryBreakdown.length > 0 ? categoryBreakdown.map((category) => (
                  <div key={category.name} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                    <span className="text-sm font-medium text-black w-16">{category.name}</span>
                    <span className="text-sm text-gray-600">{category.percentage}% (¥{category.amount.toLocaleString()})</span>
                  </div>
                )) : (
                  <div className="text-sm text-gray-500">まだ支出データがありません</div>
                )}
              </div>
            </div>
          </div>

          {/* カテゴリリスト - Zaim style */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm font-medium text-black">カテゴリ別支出</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {categoryBreakdown.length > 0 ? categoryBreakdown.map((category) => {
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
              }) : (
                <div className="p-4 text-center text-sm text-gray-500">まだ支出データがありません</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions - Zaim style */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="text-sm font-medium text-black">アクション</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <button 
              onClick={() => router.push('/expenses')}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e0f2e0' }}>
                <PlusCircle className="h-4 w-4" style={{ color: '#5a9c5a' }} />
              </div>
              <span className="text-sm font-medium text-black">支出を記録</span>
            </button>
            <button 
              onClick={() => router.push('/expenses')}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
            >
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


export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center pb-20">
        <div className="text-center space-y-4">
          <img 
            src="/logo.png" 
            alt="家計簿アプリロゴ" 
            className="w-16 h-16 mx-auto animate-pulse"
          />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zaim-blue-500 mx-auto"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
