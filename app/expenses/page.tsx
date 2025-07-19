"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Receipt, Calendar, MapPin } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase" // Firebase dbインスタンスをインポート

interface Expense {
  id: string | number;
  amount: number;
  category: string;
  description: string;
  date: string;
  location?: string;
  user_id?: string; // Firebaseのuser_idを追加
}

export default function ExpensesPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [newExpenseData, setNewExpenseData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
  });

  const categories = ["食費", "交通費", "娯楽", "学用品", "衣類", "その他"]
  const categoryColors: { [key: string]: string } = {
    食費: "bg-orange-100 text-orange-800",
    交通費: "bg-blue-100 text-blue-800",
    娯楽: "bg-purple-100 text-purple-800",
    学用品: "bg-green-100 text-green-800",
    衣類: "bg-pink-100 text-pink-800",
    その他: "bg-gray-100 text-gray-800",
  }

  // Fetch expenses from Firebase
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        // TODO: Replace with actual authenticated user ID
        const userId = "placeholder_user_id"; // For now, use a placeholder
        const q = query(collection(db, "expenses"), orderBy("date", "desc")); // Order by date
        const querySnapshot = await getDocs(q);
        const fetchedExpenses: Expense[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<Expense, 'id'>
        }));
        setExpenses(fetchedExpenses);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };
    fetchExpenses();
  }, []); // Empty dependency array means this runs once on mount

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Replace with actual authenticated user ID
      const userId = "placeholder_user_id"; // For now, use a placeholder

      const expenseToAdd = {
        amount: parseFloat(newExpenseData.amount),
        category: newExpenseData.category,
        description: newExpenseData.description,
        date: newExpenseData.date,
        location: newExpenseData.location,
        user_id: userId,
      };

      const docRef = await addDoc(collection(db, "expenses"), expenseToAdd);
      setExpenses([{ id: docRef.id, ...expenseToAdd }, ...expenses]);
      setShowAddForm(false);
      setNewExpenseData({ // Reset form
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
      });
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewExpenseData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewExpenseData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">支出記録</h1>
          <p className="text-gray-600 text-sm">お金の使い道を記録しよう</p>
        </div>

        {/* Add Button */}
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-5 w-5 mr-2" />
          支出を追加
        </Button>

        {/* Add Form */}
        {showAddForm && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">新しい支出を記録</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <Label htmlFor="amount">金額</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="500"
                    required
                    className="mt-1"
                    value={newExpenseData.amount}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="category">カテゴリ</Label>
                  <Select name="category" required value={newExpenseData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">内容</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="何を買ったか"
                    required
                    className="mt-1"
                    value={newExpenseData.description}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="location">場所</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="どこで買ったか"
                    required
                    className="mt-1"
                    value={newExpenseData.location}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="date">日付</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                    className="mt-1"
                    value={newExpenseData.date}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    記録する
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                    キャンセル
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* PayPay Integration */}
        <Card className="bg-orange-50 border border-orange-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">PayPay連携</h3>
                <p className="text-sm text-gray-600">自動で支出を記録</p>
              </div>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                連携する
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Expense List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-800">最近の支出</h2>
          {expenses.length === 0 ? (
            <p className="text-center text-gray-500">まだ支出がありません。</p>
          ) : (
            expenses.map((expense) => (
              <Card key={expense.id} className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={categoryColors[expense.category as keyof typeof categoryColors]}>
                          {expense.category}
                        </Badge>
                        <span className="text-lg font-bold text-gray-800">¥{expense.amount.toLocaleString()}</span>
                      </div>
                      <p className="font-medium text-gray-700 mb-1">{expense.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {expense.date}
                        </div>
                        {expense.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {expense.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <Receipt className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNav currentPage="expenses" />
    </div>
  )
}

