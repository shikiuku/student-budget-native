"use client"

// Student Budget Tracker - Version 2025-08-01 - Complete with Supabase Integration
import { useState, useEffect, Suspense } from "react"
import { useAuth } from "@/components/auth-provider"
import { userProfileService, expenseService, expenseCategoryService } from "@/lib/database"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, PlusCircle, BarChart3, CheckCircle, XCircle } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { getCategoryIcon } from "@/lib/category-icons"
import type { UserProfile, ExpenseWithCategory, ExpenseCategory } from "@/lib/types"
import { useRouter, useSearchParams } from "next/navigation"
import { BudgetCardSkeleton, DonutChartSkeleton, IncomeSummarySkeleton, CategorySummarySkeleton } from "@/components/skeleton"

// カテゴリー色を統一する関数（スタイルガイドに合わせた薄い背景色）
const getCategoryColor = (categoryName: string): string => {
  switch (categoryName) {
    case '食費': return '#FFF3E0'
    case '交通費': return '#E0F8F8'
    case '娯楽・趣味': return '#FFF9C4'
    case '教材・書籍': return '#E8F5E8'
    case '衣類・雑貨': return '#F8E8E8'
    case '通信費': return '#F0EDFF'
    case 'その他': return '#F3F4F6'
    default: return '#F3F4F6'
  }
}

// カテゴリーアイコンの色を取得する関数（スタイルガイドに合わせた濃い色）
const getCategoryIconColor = (categoryName: string): string => {
  switch (categoryName) {
    case '食費': return '#FF6B35'
    case '交通費': return '#4ECDC4'
    case '娯楽・趣味': return '#FFD23F'
    case '教材・書籍': return '#6A994E'
    case '衣類・雑貨': return '#BC4749'
    case '通信費': return '#9C88FF'
    case 'その他': return '#6B7280'
    default: return '#6B7280'
  }
}

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
      checkMonthEndSavings()
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

  const checkMonthEndSavings = async () => {
    if (!user) return

    try {
      const now = new Date()
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      // 月末チェック（最終日の場合のみ実行）
      if (now.getDate() === lastDay.getDate()) {
        // ローカルストレージで今月の貯金追加が完了しているかチェック
        const savingsKey = `savings_added_${now.getFullYear()}_${now.getMonth()}_${user.id}`
        const savingsAdded = localStorage.getItem(savingsKey)
        
        if (!savingsAdded) {
          // プロフィールと支出データを取得
          const profileResult = await userProfileService.getProfile(user.id)
          const expensesResult = await expenseService.getExpensesByMonth(user.id, now.getFullYear(), now.getMonth() + 1)
          
          if (profileResult.success && profileResult.data && expensesResult.success && expensesResult.data) {
            const monthlyBudget = profileResult.data.monthly_budget || 0
            const monthlyExpenses = expensesResult.data.reduce((sum, expense) => sum + expense.amount, 0)
            const remaining = monthlyBudget - monthlyExpenses
            
            // 余剰があった場合のみ貯金に追加
            if (remaining > 0) {
              const currentSavings = profileResult.data.savings_balance || 0
              const newSavingsBalance = currentSavings + remaining
              const result = await userProfileService.updateProfile(user.id, { savings_balance: newSavingsBalance } as any)
              if (result.success) {
                // 今月の貯金追加完了をマーク
                localStorage.setItem(savingsKey, 'true')
                
                console.log(`月末貯金追加: ¥${remaining}を貯金に追加しました`)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('月末貯金チェックエラー:', error)
    }
  }

  // Calculate budget and spending data
  const monthlyBudget = userProfile?.monthly_budget || 0
  const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const remaining = monthlyBudget - spent
  const spentPercentage = monthlyBudget > 0 ? (spent / monthlyBudget) * 100 : 0

  // Calculate category breakdown
  const categoryBreakdown = categories.map(category => {
    const categoryExpenses = expenses.filter(exp => exp.category_id === category.id)
    const amount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    const percentage = spent > 0 ? Math.round((amount / spent) * 100) : 0
    const IconComponent = getCategoryIcon(category.name)
    
    return {
      id: category.id,
      name: category.name,
      amount,
      icon: IconComponent,
      color: getCategoryColor(category.name), // 背景色
      iconColor: getCategoryIconColor(category.name), // アイコン色
      percentage,
      categoryObj: category // 元のカテゴリーオブジェクト
    }
  }).filter(cat => cat.amount > 0) // Only show categories with expenses
    .sort((a, b) => b.amount - a.amount) // Sort by amount descending (highest first)
  
  // Zaim style: 緑=余裕、黄=注意、赤=危険
  const getBudgetStatus = (percentage: number) => {
    if (percentage <= 60) return { color: 'zaim-green-500', bgColor: 'zaim-green-50', borderColor: 'zaim-green-500', status: '余裕あり' }
    if (percentage <= 80) return { color: 'zaim-yellow-500', bgColor: 'zaim-yellow-50', borderColor: 'zaim-yellow-500', status: '注意' }
    return { color: 'zaim-red-500', bgColor: 'zaim-red-50', borderColor: 'zaim-red-500', status: '要注意' }
  }
  
  const budgetStatus = getBudgetStatus(spentPercentage)

  // 認証チェック中、データ読み込み中、プロフィール未設定時は全てスケルトンローディング表示
  if (loading || !user || dataLoading || !userProfile) {
    // プロフィール未設定の場合はオンボーディングにリダイレクト（バックグラウンドで実行）
    if (!loading && user && !dataLoading && !userProfile) {
      router.push('/onboarding')
    }
    // ログインが必要な場合はログインページにリダイレクト（バックグラウンドで実行）
    if (!loading && !user) {
      router.push('/login')
    }
    
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="px-6 py-4 space-y-6 pt-6">
          <BudgetCardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <IncomeSummarySkeleton />
            <DonutChartSkeleton />
          </div>
          <CategorySummarySkeleton />
        </div>
        <BottomNav currentPage="home" />
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
        {/* Budget and Savings Display - 動的丸角強調スタイル */}
        <div className={`${
          spentPercentage <= 60 ? 'bg-green-50 border-green-100' :
          spentPercentage <= 80 ? 'bg-yellow-50 border-yellow-100' :
          spentPercentage <= 100 ? 'bg-red-50 border-red-100' :
          'bg-red-50 border-red-200'
        } border rounded-2xl p-6`}>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${
                  spentPercentage <= 60 ? 'bg-green-300' :
                  spentPercentage <= 80 ? 'bg-yellow-300' :
                  spentPercentage <= 100 ? 'bg-red-300' :
                  'bg-red-400'
                }`}></div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  spentPercentage <= 60 ? 'text-green-600 bg-green-25' :
                  spentPercentage <= 80 ? 'text-yellow-600 bg-yellow-25' :
                  spentPercentage <= 100 ? 'text-red-600 bg-red-25' :
                  'text-red-700 bg-red-100'
                }`}>
                  {spentPercentage <= 60 ? '余裕あり' :
                   spentPercentage <= 80 ? '注意' :
                   spentPercentage <= 100 ? '要注意' :
                   '予算オーバー'}
                </span>
              </div>
              <div>
                <div className={`text-2xl font-bold ${
                  spentPercentage > 100 ? 'text-red-600' : 'text-black'
                }`}>
                  {spentPercentage > 100 ? '-' : ''}¥{Math.abs(remaining).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">今月使える金額</div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>予算 ¥{monthlyBudget.toLocaleString()}</span>
                  <span>使用 {spentPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      spentPercentage <= 60 ? 'bg-green-300' :
                      spentPercentage <= 80 ? 'bg-yellow-400' :
                      spentPercentage <= 100 ? 'bg-red-400' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className={`border-l-2 pl-6 space-y-3 ${
              spentPercentage <= 60 ? 'border-green-100' :
              spentPercentage <= 80 ? 'border-yellow-100' :
              'border-red-100'
            }`}>
              <div className="text-sm text-gray-600">貯金残高</div>
              <div className="text-2xl font-bold text-green-500">¥{(userProfile?.savings_balance || 0).toLocaleString()}</div>
              <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">月末に余った予算を自動追加</div>
            </div>
          </div>
        </div>

        {/* iPad Layout: Income/Expense + Chart Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Donut Chart - iPad Layout */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-black mb-4">支出内訳</h2>
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 mb-4">
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
                        stroke={category.iconColor} 
                        strokeWidth="16" 
                        strokeDasharray={`${category.percentage * 5.03} 502.65`} 
                        strokeDashoffset={`-${prevPercentage * 5.03}`}
                      />
                    )
                  })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold text-black">¥{spent.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">合計支出</div>
                  </div>
                </div>
              </div>
              <div className="space-y-1 text-center">
                {categoryBreakdown.length > 0 ? categoryBreakdown.map((category) => (
                  <div key={category.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.iconColor }}></div>
                    <span className="font-medium text-black">{category.name}</span>
                    <span className="text-gray-600">{category.percentage}%</span>
                  </div>
                )) : (
                  <div className="text-xs text-gray-500">まだ支出データがありません</div>
                )}
              </div>
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
                      <Icon className="h-4 w-4" style={{ color: category.iconColor }} />
                    </div>
                    <span className="text-sm font-medium text-black">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-black">¥{category.amount.toLocaleString()}</span>
                  </div>
                </div>
              )
            }) : (
              <div className="p-4 text-center text-sm text-gray-500">まだ支出データがありません</div>
            )}
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
      <div className="min-h-screen bg-white pb-20">
        <div className="px-6 py-4 space-y-6 pt-6">
          <BudgetCardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <IncomeSummarySkeleton />
            <DonutChartSkeleton />
          </div>
          <CategorySummarySkeleton />
        </div>
        <BottomNav currentPage="home" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
