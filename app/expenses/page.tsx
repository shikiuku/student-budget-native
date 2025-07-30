"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, MapPin, Pencil, Trash2 } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { collection, getDocs, addDoc, query, orderBy, doc, deleteDoc, where } from "firebase/firestore"
import { db, auth } from "@/lib/firebase" // Firebase dbインスタンスとauthをインポート
import { onAuthStateChanged } from "firebase/auth"; // 認証状態の変更を監視
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'; // Dialogコンポーネントをインポート
import PayPayCsvUpload from '@/components/paypay-csv-upload'; // PayPayCsvUploadコンポーネントをインポート
import { useToast } from '@/components/ui/use-toast'; // useToastをインポート

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
  const [currentUser, setCurrentUser] = useState<any>(null); // Firebaseユーザー情報を保持

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);
  const [newExpenseData, setNewExpenseData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
  });
  const [isPayPayDialogOpen, setIsPayPayDialogOpen] = useState(false); // PayPayダイアログの状態
  const { toast } = useToast(); // useToastを初期化

  const handlePayPayUploadSuccess = () => {
    setIsPayPayDialogOpen(false); // ダイアログを閉じる
    toast({
      title: "アップロード完了",
      description: "PayPayの支出履歴が正常に記録されました。",
    });
    // 支出リストを再フェッチして最新の状態を反映
    fetchExpenses();
  };

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
  const fetchExpenses = async () => {
    try {
      // TODO: Replace with actual authenticated user ID
      if (!currentUser) {
        console.warn("No authenticated user for fetching expenses.");
        return;
      }
      const userId = currentUser.uid;
      const q = query(collection(db, "expenses"), where("user_id", "==", userId), orderBy("date", "desc")); // Order by date and filter by user_id
      const querySnapshot = await getDocs(q);
      const fetchedExpenses: Expense[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Expense, 'id'>
      }));
      setExpenses(fetchedExpenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast({ title: "エラー", description: "支出の取得中にエラーが発生しました。", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchExpenses();
    }
  }, [currentUser]); // currentUserが変更されたときに再フェッチ

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentUser) {
        toast({
          title: "認証エラー",
          description: "支出を追加するにはログインしてください。",
          variant: "destructive",
        });
        return;
      }
      const userId = currentUser.uid;

      const expenseToAdd = {
        amount: parseFloat(newExpenseData.amount),
        category: newExpenseData.category,
        description: newExpenseData.description,
        date: newExpenseData.date,
        location: newExpenseData.location,
        user_id: userId,
      };

      const docRef = await addDoc(collection(db, "expenses"), expenseToAdd);
      
      // 状態を更新してUIに即時反映
      setExpenses(prev => [{ id: docRef.id, ...expenseToAdd }, ...prev]);

      setShowAddForm(false);
      setNewExpenseData({ // Reset form
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
      });
      toast({ title: "成功", description: "新しい支出を記録しました。" });
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({ title: "エラー", description: "支出の追加中にエラーが発生しました。", variant: "destructive" });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewExpenseData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewExpenseData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (expense: Expense) => {
    // TODO: 編集フォームをダイアログで表示するなどの実装
    console.log("Editing expense:", expense);
    toast({
      title: "編集機能は開発中です",
      description: `ID: ${expense.id}`,
    });
  };

  const handleDeleteExpense = async (id: string | number) => {
    try {
      if (!currentUser) {
        toast({
          title: "認証エラー",
          description: "支出を削除するにはログインしてください。",
          variant: "destructive",
        });
        return;
      }
      await deleteDoc(doc(db, "expenses", String(id)));
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      toast({ title: "成功", description: "支出を削除しました。" });
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({ title: "エラー", description: "支出の削除中にエラーが発生しました。", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">支出記録</h1>
          <p className="text-gray-600 text-sm">お金の使い道を記録しよう</p>
          {currentUser ? (
            <p className="text-sm text-green-600">Authenticated as: {currentUser.email} (UID: {currentUser.uid})</p>
          ) : (
            <p className="text-sm text-red-600">Not authenticated.</p>
          )}
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
              <Dialog open={isPayPayDialogOpen} onOpenChange={setIsPayPayDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                    連携する
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>PayPay CSVファイルをアップロード</DialogTitle>
                  </DialogHeader>
                  <PayPayCsvUpload onUploadSuccess={handlePayPayUploadSuccess} />
                </DialogContent>
              </Dialog>
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
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNav currentPage="expenses" />
    </div>
  );
}
