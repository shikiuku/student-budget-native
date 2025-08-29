"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { expenseService, expenseCategoryService, csvImportService, userProfileService } from "@/lib/database"
import { PayPayCsvParser } from "@/lib/csv-parser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, Calendar, Receipt, Edit, Trash2, Upload, FileText } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { CategoryIconSelector } from "@/components/category-icon-selector"
import { getCategoryIcon } from "@/lib/category-icons"
import type { ExpenseWithCategory, ExpenseCategory, ExpenseForm, UserProfile } from "@/lib/types"

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

export default function ExpensesPage() {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // デバッグ用ログ
  console.log('支出ページ - 認証状態:', { user: !!user, loading })
  
  
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [csvImporting, setCsvImporting] = useState(false)
  const [showingAllHistory, setShowingAllHistory] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [currentMonthTotal, setCurrentMonthTotal] = useState(0)
  
  const [newExpense, setNewExpense] = useState<ExpenseForm>({
    amount: "",
    category_id: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  })

  // カテゴリーアイコンが変更された時の処理
  const handleCategoryIconChanged = async (categoryName: string, newIcon: string) => {
    if (!user || !userProfile) return
    
    // ユーザープロフィールのカテゴリーアイコン設定を更新
    const result = await userProfileService.updateCategoryIcon(user.id, categoryName, newIcon)
    
    if (result.success) {
      // ローカルステートを更新
      setUserProfile(prev => {
        if (!prev) return prev
        const updatedCategoryIcons = { ...prev.category_icons, [categoryName]: newIcon }
        return { ...prev, category_icons: updatedCategoryIcons }
      })
      
      toast({
        title: "アイコンを更新しました",
        description: `${categoryName}のアイコンを変更しました`
      })
    } else {
      toast({
        title: "エラー",
        description: "アイコンの更新に失敗しました",
        variant: "destructive"
      })
    }
  }

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
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

      // Load current month expenses first
      const now = new Date()
      const expensesResult = await expenseService.getExpensesByMonth(user.id, now.getFullYear(), now.getMonth() + 1)
      if (expensesResult.success && expensesResult.data) {
        setExpenses(expensesResult.data)
        setCurrentMonthTotal(expensesResult.data.reduce((sum, expense) => sum + expense.amount, 0))
      }
    } catch (error) {
      toast({
        title: "データ読み込みエラー",
        description: "データの読み込みに失敗しました。",
        variant: "destructive",
      })
    } finally {
      setDataLoading(false)
    }
  }

  const loadAllHistory = async () => {
    if (!user || loadingHistory) return

    setLoadingHistory(true)
    try {
      // Load all expenses
      const expensesResult = await expenseService.getExpenses(user.id, 1000) // Load up to 1000 expenses
      if (expensesResult.success && expensesResult.data) {
        setExpenses(expensesResult.data)
        setShowingAllHistory(true)
      }
    } catch (error) {
      toast({
        title: "履歴読み込みエラー",
        description: "支出履歴の読み込みに失敗しました。",
        variant: "destructive",
      })
    } finally {
      setLoadingHistory(false)
    }
  }

  const backToCurrentMonth = () => {
    setShowingAllHistory(false)
    loadData()
  }

  // Use current month total for the summary display
  const totalSpent = currentMonthTotal

  const handleAddExpense = async () => {
    if (!user || !newExpense.amount || !newExpense.category_id || !newExpense.description) {
      toast({
        title: "入力エラー",
        description: "すべての項目を入力してください。",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await expenseService.createExpense(user.id, {
        amount: parseInt(newExpense.amount),
        category_id: newExpense.category_id,
        description: newExpense.description,
        date: newExpense.date,
        source: 'manual'
      })

      if (result.success) {
        toast({
          title: "支出を追加しました",
          description: `¥${parseInt(newExpense.amount).toLocaleString()} - ${newExpense.description}`,
          variant: "success",
        })
        
        // Reset form
        setNewExpense({
          amount: "",
          category_id: "",
          description: "",
          date: new Date().toISOString().split('T')[0]
        })
        setShowAddForm(false)
        
        // Reload current month data only
        loadData()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "支出追加エラー",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const deleteExpense = async (expenseId: string) => {
    try {
      const result = await expenseService.deleteExpense(expenseId)
      
      if (result.success) {
        toast({
          title: "支出を削除しました",
          variant: "success",
        })
        loadData()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "削除エラー",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const handleCsvUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "ファイル形式エラー",
        description: "CSVファイルを選択してください。",
        variant: "destructive",
      })
      return
    }

    setCsvImporting(true)
    try {
      const fileContent = await file.text()
      const records = PayPayCsvParser.parseCSV(fileContent)
      
      if (records.length === 0) {
        toast({
          title: "インポートエラー",
          description: "有効な支出データが見つかりませんでした。",
          variant: "destructive",
        })
        return
      }

      // Convert to expense format
      const expenseData = PayPayCsvParser.convertToExpenses(records, categories, user.id)
      
      // Insert expenses
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      for (const expense of expenseData) {
        try {
          const result = await expenseService.createExpense(user.id, expense)
          if (result.success) {
            successCount++
          } else {
            errorCount++
            errors.push(result.error || 'Unknown error')
          }
        } catch (error) {
          errorCount++
          errors.push((error as Error).message)
        }
      }

      // Log import
      await csvImportService.createImportLog(user.id, {
        filename: file.name,
        source_type: 'paypay',
        total_records: records.length,
        successful_imports: successCount,
        failed_imports: errorCount,
        errors: errors.length > 0 ? { errors } : undefined
      })

      toast({
        title: "CSVインポート完了",
        description: `${successCount}件の支出を追加しました。${errorCount > 0 ? `${errorCount}件のエラーがありました。` : ''}`,
        variant: "success",
      })

      // Show all history immediately after import to show imported data
      loadAllHistory()
    } catch (error) {
      toast({
        title: "CSVインポートエラー",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setCsvImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Wait for auth loading to complete first
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pb-20">
        <div className="text-center space-y-4">
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
          <p className="text-gray-600">ログインが必要です</p>
        </div>
      </div>
    )
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pb-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zaim-blue-500 mx-auto"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="px-6 py-4 space-y-6 pt-6">
        {/* Summary Card */}
        <div className="bg-zaim-blue-50 border border-zaim-blue-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-black">¥{totalSpent.toLocaleString()}</div>
            <div className="text-sm text-gray-600">今月の支出合計</div>
          </div>
        </div>

        {/* Add Expense Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white h-12"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            手動で支出を記録
          </Button>
          
          <Button 
            onClick={handleCsvUpload}
            className="bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white h-12"
            disabled={csvImporting}
          >
            {csvImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                インポート中...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                PayPay CSVをインポート
              </>
            )}
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Add Expense Form */}
        {showAddForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
            <h2 className="text-lg font-bold text-black">新しい支出を記録</h2>
            
            <div>
              <Label htmlFor="amount">金額</Label>
              <Input
                id="amount"
                type="number"
                placeholder="500"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="mt-1 bg-white text-black border-gray-300 focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400"
              />
            </div>

            <div>
              <Label htmlFor="category">カテゴリ</Label>
              <Select
                value={newExpense.category_id}
                onValueChange={(value) => setNewExpense({ ...newExpense, category_id: value })}
              >
                <SelectTrigger className="mt-1 border-zaim-blue-200 focus:ring-zaim-blue-400 focus:border-zaim-blue-400 bg-white text-black">
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {categories
                    .sort((a, b) => {
                      // 食費を最初に表示
                      if (a.name === '食費') return -1
                      if (b.name === '食費') return 1
                      // その他を最後に表示
                      if (a.name === 'その他') return 1
                      if (b.name === 'その他') return -1
                      // その他のカテゴリは名前順
                      return a.name.localeCompare(b.name)
                    })
                    .map((category) => (
                    <SelectItem key={category.id} value={category.id} className="bg-white text-black hover:bg-gray-50 hover:text-black focus:bg-gray-50 focus:text-black data-[highlighted]:bg-gray-50 data-[highlighted]:text-black">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">説明</Label>
              <Input
                id="description"
                placeholder="コンビニ弁当"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="mt-1 bg-white text-black border-gray-300 focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400"
              />
            </div>

            <div>
              <Label htmlFor="date">日付</Label>
              <Input
                id="date"
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="mt-1 bg-white text-black border-gray-300 focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddExpense} className="flex-1 bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white">
                記録する
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1 border-zaim-blue-200 text-zaim-blue-600 hover:bg-zaim-blue-50">
                キャンセル
              </Button>
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-black">
              {showingAllHistory ? "すべての支出履歴" : "今月の支出履歴"}
            </h2>
            {showingAllHistory && (
              <Button 
                onClick={backToCurrentMonth}
                variant="outline"
                size="sm"
                className="border-zaim-blue-200 text-zaim-blue-600 hover:bg-zaim-blue-50"
              >
                今月に戻る
              </Button>
            )}
          </div>
          
          {expenses.map((expense, index) => {
            const IconComponent = getCategoryIcon(expense.category?.name || 'その他', userProfile?.category_icons || undefined)
            const expenseDate = new Date(expense.date)
            const currentExpenseMonth = `${expenseDate.getFullYear()}年${expenseDate.getMonth() + 1}月`
            
            // Show month header for the first expense of each month (only when showing all history)
            const prevExpense = index > 0 ? expenses[index - 1] : null
            const prevExpenseMonth = prevExpense ? 
              `${new Date(prevExpense.date).getFullYear()}年${new Date(prevExpense.date).getMonth() + 1}月` : null
            const showMonthHeader = showingAllHistory && (!prevExpense || currentExpenseMonth !== prevExpenseMonth)
            
            return (
              <div key={expense.id}>
                {showMonthHeader && (
                  <div className="text-sm font-medium text-gray-600 mt-6 mb-2 px-2">
                    {currentExpenseMonth}
                  </div>
                )}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: getCategoryColor(expense.category?.name || 'その他') }}
                      >
                        <IconComponent 
                          className="h-5 w-5" 
                          style={{ color: getCategoryIconColor(expense.category?.name || 'その他') }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-black">¥{expense.amount.toLocaleString()}</span>
                          <Badge className="bg-zaim-blue-100 text-zaim-blue-600">
                            {expense.category?.name || "未分類"}
                          </Badge>
                          {expense.source === 'paypay_csv' && (
                            <Badge className="bg-zaim-yellow-100 text-zaim-yellow-600">
                              <FileText className="h-3 w-3 mr-1" />
                              PayPay
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-black">{expense.description}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3" />
                          {expense.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-zaim-blue-600 hover:bg-zaim-blue-50">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-zaim-red-500 hover:text-zaim-red-600"
                        onClick={() => deleteExpense(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
        </div>

        {/* Category Summary - Current Month Only */}
        {!showingAllHistory && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-bold text-black mb-4">今月のカテゴリ別集計</h2>
            <div className="space-y-3">
              {categories.map((category) => {
                // Filter current month expenses only for category summary
                const currentMonth = new Date()
                const currentMonthExpenses = expenses.filter(exp => {
                  const expenseDate = new Date(exp.date)
                  return exp.category_id === category.id && 
                         expenseDate.getMonth() === currentMonth.getMonth() && 
                         expenseDate.getFullYear() === currentMonth.getFullYear()
                })
                const categoryTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
                const IconComponent = getCategoryIcon(category.name, userProfile?.category_icons || undefined)
                
                if (categoryTotal === 0) return null
                
                return (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: getCategoryColor(category.name) }}
                      >
                        <IconComponent 
                          className="h-4 w-4" 
                          style={{ color: getCategoryIconColor(category.name) }}
                        />
                      </div>
                      <span className="text-sm font-medium text-black">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-black">¥{categoryTotal.toLocaleString()}</span>
                      <CategoryIconSelector 
                        categoryName={category.name}
                        currentIcon={userProfile?.category_icons?.[category.name]}
                        userCategoryIcons={userProfile?.category_icons || undefined}
                        onIconChanged={handleCategoryIconChanged}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Show all history button - Always show when not showing all history */}
        {!showingAllHistory && (
          <div className="text-center py-6">
            <Button 
              onClick={loadAllHistory}
              disabled={loadingHistory}
              className="bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white"
            >
              {loadingHistory ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  読み込み中...
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4 mr-2" />
                  これまでの支出記録を見る
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <BottomNav currentPage="expenses" />
    </div>
  )
}