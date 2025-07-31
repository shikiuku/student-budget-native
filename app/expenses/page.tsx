"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Calendar, Receipt, Utensils, Car, ShoppingBag, BookOpen, Home, Edit, Trash2 } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      amount: 500,
      category: "食費",
      description: "コンビニ弁当",
      date: "2024-01-31",
      icon: Utensils,
      color: "#f97316"
    },
    {
      id: 2,
      amount: 300,
      category: "交通費",
      description: "電車代",
      date: "2024-01-30",
      icon: Car,
      color: "#3b82f6"
    },
    {
      id: 3,
      amount: 1200,
      category: "娯楽",
      description: "映画鑑賞",
      date: "2024-01-29",
      icon: ShoppingBag,
      color: "#a855f7"
    },
    {
      id: 4,
      amount: 800,
      category: "学用品",
      description: "参考書",
      date: "2024-01-28",
      icon: BookOpen,
      color: "#22c55e"
    }
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  })

  const categoryOptions = [
    { name: "食費", icon: Utensils, color: "#f97316" },
    { name: "交通費", icon: Car, color: "#3b82f6" },
    { name: "娯楽", icon: ShoppingBag, color: "#a855f7" },
    { name: "学用品", icon: BookOpen, color: "#22c55e" },
    { name: "その他", icon: Home, color: "#6b7280" }
  ]

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const handleAddExpense = () => {
    if (newExpense.amount && newExpense.category && newExpense.description) {
      const categoryData = categoryOptions.find(cat => cat.name === newExpense.category)
      const expense = {
        id: Date.now(),
        amount: parseInt(newExpense.amount),
        category: newExpense.category,
        description: newExpense.description,
        date: newExpense.date,
        icon: categoryData?.icon || Home,
        color: categoryData?.color || "#6b7280"
      }
      setExpenses([expense, ...expenses])
      setNewExpense({
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split('T')[0]
      })
      setShowAddForm(false)
    }
  }

  const deleteExpense = (id: number) => {
    setExpenses(expenses.filter(expense => expense.id !== id))
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 space-y-6 pt-6">
        {/* Summary Card */}
        <div className="bg-zaim-green-50 border border-zaim-green-500 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-black">¥{totalSpent.toLocaleString()}</div>
            <div className="text-sm text-gray-600">今月の支出合計</div>
          </div>
        </div>

        {/* Add Expense Button */}
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full bg-zaim-green-500 hover:bg-zaim-green-600 text-white h-12"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          支出を記録
        </Button>

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
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category">カテゴリ</Label>
              <Select
                value={newExpense.category}
                onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
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
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="date">日付</Label>
              <Input
                id="date"
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddExpense} className="flex-1 bg-zaim-green-500 hover:bg-zaim-green-600 text-white">
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
            const Icon = expense.icon
            return (
              <div key={expense.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: expense.color }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-black">¥{expense.amount.toLocaleString()}</span>
                        <Badge className="bg-gray-100 text-gray-800">
                          {expense.category}
                        </Badge>
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
            {categoryOptions.map((category) => {
              const categoryExpenses = expenses.filter(exp => exp.category === category.name)
              const categoryTotal = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)
              const Icon = category.icon
              
              if (categoryTotal === 0) return null
              
              return (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <Icon className="h-4 w-4 text-white" />
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