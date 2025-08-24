"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { expenseService, expenseCategoryService, csvImportService } from "@/lib/database"
import { PayPayCsvParser } from "@/lib/csv-parser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, Calendar, Receipt, Utensils, Car, ShoppingBag, BookOpen, Home, Edit, Trash2, Upload, FileText } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import type { ExpenseWithCategory, ExpenseCategory, ExpenseForm } from "@/lib/types"

export default function ExpensesPage() {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // デバッグ用ログ
  console.log('支出ページ - 認証状態:', { user: !!user, loading })
  
  
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [csvImporting, setCsvImporting] = useState(false)
  
  const [newExpense, setNewExpense] = useState<ExpenseForm>({
    amount: "",
    category_id: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  })

  const iconMap = {
    "Utensils": Utensils,
    "Car": Car,
    "ShoppingBag": ShoppingBag,
    "BookOpen": BookOpen,
    "Shirt": Home, // Default for shirt
    "Home": Home
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
      // Load categories
      const categoriesResult = await expenseCategoryService.getCategories()
      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data)
      }

      // Load expenses
      const expensesResult = await expenseService.getExpenses(user.id, 50)
      if (expensesResult.success && expensesResult.data) {
        setExpenses(expensesResult.data)
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

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)

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
        
        // Reload data
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

      // Reload data
      loadData()
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
          <h2 className="text-lg font-bold text-black">支出履歴</h2>
          
          {expenses.map((expense) => {
            const IconComponent = expense.category?.icon ? iconMap[expense.category.icon as keyof typeof iconMap] || Home : Home
            return (
              <div key={expense.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: expense.category?.color || "#6b7280" }}
                    >
                      <IconComponent className="h-5 w-5 text-white" />
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
            )
          })}
        </div>

        {/* Category Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-bold text-black mb-4">カテゴリ別集計</h2>
          <div className="space-y-3">
            {categories.map((category) => {
              const categoryExpenses = expenses.filter(exp => exp.category_id === category.id)
              const categoryTotal = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)
              const IconComponent = category.icon ? iconMap[category.icon as keyof typeof iconMap] || Home : Home
              
              if (categoryTotal === 0) return null
              
              return (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: category.color || "#6b7280" }}
                    >
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-black">{category.name}</span>
                  </div>
                  <span className="text-sm font-bold text-black">¥{categoryTotal.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <BottomNav currentPage="expenses" />
    </div>
  )
}