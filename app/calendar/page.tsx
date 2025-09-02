'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BottomNav } from '@/components/bottom-nav';
import { useAuth } from "@/components/auth-provider";
import { userProfileService, expenseService, expenseCategoryService } from "@/lib/database";
import { getCategoryIcon } from "@/lib/category-icons";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, ExpenseWithCategory, ExpenseCategory, ExpenseForm } from "@/lib/types";

const CalendarPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [monthlyBudget, setMonthlyBudget] = useState(30000);
  const [spent, setSpent] = useState(0);
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newExpense, setNewExpense] = useState<ExpenseForm>({
    amount: "",
    category_id: "",
    description: "",
    date: (() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    })()
  });


  // 月の最初の日と最後の日を取得
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // カレンダーの開始日（前月の日曜日から）
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  // カレンダーの終了日（翌月の土曜日まで）
  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load user data
  useEffect(() => {
    if (user) {
      console.log("カレンダーページ - ユーザー認証済み:", user.id);
      loadUserData();
    } else {
      console.log("カレンダーページ - ユーザー未認証");
    }
  }, [user, currentDate]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const profileResult = await userProfileService.getProfile(user.id);
      if (profileResult.success && profileResult.data) {
        setUserProfile(profileResult.data);
        setMonthlyBudget(profileResult.data.monthly_budget || 30000);
      }

      // Load categories
      const categoriesResult = await expenseCategoryService.getCategories();
      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data);
        console.log("カテゴリ一覧:", categoriesResult.data);
      }

      // Load current month expenses
      console.log("現在の月を取得:", currentDate.getMonth() + 1, "月");
      const expensesResult = await expenseService.getExpensesByMonth(user.id, currentDate.getFullYear(), currentDate.getMonth() + 1);
      if (expensesResult.success && expensesResult.data) {
        console.log("取得した支出データ:", expensesResult.data);
        setExpenses(expensesResult.data);
        const total = expensesResult.data.reduce((sum, expense) => sum + expense.amount, 0);
        setSpent(total);
      } else {
        console.log("支出データ取得エラー:", expensesResult.error);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // 実際の支出データを日付ごとにグループ化
  const getExpensesByDate = () => {
    const expensesByDate: { [key: number]: ExpenseWithCategory[] } = {};
    
    console.log("支出をグループ化:", {
      totalExpenses: expenses.length,
      currentMonth: currentDate.getMonth(),
      currentYear: currentDate.getFullYear()
    });
    
    expenses.forEach(expense => {
      // 日付文字列を直接分割してタイムゾーンの問題を回避
      const [year, month, day] = expense.date.split('-').map(Number);
      console.log("支出日付チェック:", {
        expenseDate: expense.date,
        parsedYear: year,
        parsedMonth: month - 1, // 0ベースに変換
        parsedDay: day,
        currentMonth: currentDate.getMonth(),
        currentYear: currentDate.getFullYear()
      });
      
      if (month - 1 === currentDate.getMonth() && 
          year === currentDate.getFullYear()) {
        if (!expensesByDate[day]) {
          expensesByDate[day] = [];
        }
        expensesByDate[day].push(expense);
      }
    });
    
    console.log("グループ化結果:", expensesByDate);
    return expensesByDate;
  };

  const expensesByDate = getExpensesByDate();

  const generateCalendarDays = () => {
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
  };

  const getDayExpense = (date: Date) => {
    const dateStr = formatDate(date);
    console.log("getDayExpense - 日付検索:", dateStr);
    const dayExpenses = expenses.filter(expense => expense.date === dateStr);
    if (dayExpenses.length > 0) {
      console.log("getDayExpense - 見つかった支出:", dayExpenses);
    }
    return dayExpenses;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1);
    setCurrentDate(newDate);
    // 月が変更されたら選択日をクリア（何も選択されていない状態）
    setSelectedDate(null);
  };

  const handleDateClick = (date: number) => {
    setSelectedDate(date);
    // 選択した日付で新規支出フォームの日付を設定
    // タイムゾーンの問題を避けるため、年月日を直接指定
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = date.toString().padStart(2, '0');
    setNewExpense(prev => ({
      ...prev,
      date: `${year}-${month}-${day}`
    }));
  };

  const handleAddExpense = async () => {
    if (!user) {
      console.error("ユーザー未認証");
      toast({
        title: "認証エラー",
        description: "ログインしてください。",
        variant: "destructive",
      });
      return;
    }

    if (!newExpense.amount || !newExpense.category_id) {
      toast({
        title: "入力エラー",
        description: "金額とカテゴリを入力してください。",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("支出追加処理開始:", {
        userId: user.id,
        amount: parseInt(newExpense.amount),
        category_id: newExpense.category_id,
        description: newExpense.description,
        date: newExpense.date,
        source: 'manual'
      });

      const result = await expenseService.createExpense(user.id, {
        amount: parseInt(newExpense.amount),
        category_id: newExpense.category_id,
        description: newExpense.description,
        date: newExpense.date,
        source: 'manual'
      });

      console.log("支出追加結果:", result);

      if (result.success) {
        toast({
          title: "支出を追加しました",
          description: `¥${parseInt(newExpense.amount).toLocaleString()} - ${newExpense.description}`,
          variant: "success",
        });
        
        // Reset form
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = (selectedDate || 1).toString().padStart(2, '0');
        setNewExpense({
          amount: "",
          category_id: "",
          description: "",
          date: `${year}-${month}-${day}`
        });
        setShowAddForm(false);
        
        // Reload data
        loadUserData();
      } else {
        throw new Error(result.error || "不明なエラー");
      }
    } catch (error) {
      console.error("支出追加エラー:", error);
      toast({
        title: "支出追加エラー",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const calendarDays = generateCalendarDays();
  const monthlyIncome = monthlyBudget;
  const monthlyExpenses = spent;
  const balance = monthlyIncome - monthlyExpenses;

  // Prevent hydration mismatch by showing a loading state initially
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-3 sm:px-6 py-4 pb-32 max-w-6xl">
          <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-blue-50 p-3 sm:p-6 rounded-lg text-center animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-6 bg-gray-300 rounded"></div>
            </div>
            <div className="bg-red-50 p-3 sm:p-6 rounded-lg text-center animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-6 bg-gray-300 rounded"></div>
            </div>
            <div className="bg-green-50 p-3 sm:p-6 rounded-lg text-center animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-6 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6 md:p-8">
            <div className="h-8 bg-gray-300 rounded mb-4 animate-pulse"></div>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {[...Array(42)].map((_, i) => (
                <div key={i} className="h-10 sm:h-14 md:h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        <BottomNav currentPage="calendar" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4 pb-32 md:pb-24 max-w-6xl">
        {/* Month Navigation - Outside Card */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3">
          <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-lg border border-gray-200 p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeMonth(-1)}
              className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </Button>
            <span className="text-sm sm:text-xl font-medium px-3 sm:px-6 min-w-[150px] sm:min-w-[200px] text-center text-black">
              {formatMonth(currentDate)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeMonth(1)}
              className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </Button>
          </div>
        </div>
        
        {/* Monthly Summary - Outside Card */}
        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div className="bg-blue-50 px-2 py-1 rounded">
            <div className="text-xs text-gray-600">収入</div>
            <div className="text-sm font-bold text-blue-600">¥{monthlyIncome.toLocaleString()}</div>
          </div>
          <div className="bg-red-50 px-2 py-1 rounded">
            <div className="text-xs text-gray-600">支出</div>
            <div className="text-sm font-bold text-red-600">¥{monthlyExpenses.toLocaleString()}</div>
          </div>
          <div className="bg-green-50 px-2 py-1 rounded">
            <div className="text-xs text-gray-600">残高</div>
            <div className="text-sm font-bold text-green-600">¥{balance.toLocaleString()}</div>
          </div>
        </div>

        {/* Calendar Card - Only Calendar */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6 md:p-3">

          {/* Calendar */}
          <div className="">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-px mb-1 sm:mb-2">
              {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                <div key={day} className={`text-center text-xs sm:text-sm font-medium py-1 sm:py-2 ${
                  i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-600'
                }`}>{day}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-px mb-3 sm:mb-4 md:mb-2">
              {calendarDays.map((day, i) => {
                const date = day.getDate();
                const today = isClient ? new Date() : null;
                const isToday = isClient && today && date === today.getDate() && 
                               day.getMonth() === today.getMonth() && 
                               day.getFullYear() === today.getFullYear();
                const isCurrentMonthDay = isCurrentMonth(day);
                const hasExpenses = isCurrentMonthDay && expensesByDate[date] && expensesByDate[date].length > 0;
                const isSelected = isCurrentMonthDay && selectedDate !== null && date === selectedDate;
                
                return (
                  <div key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`} className="text-center py-1 sm:py-2 md:py-0 h-10 sm:h-14 md:h-9 flex items-center justify-center">
                    {isCurrentMonthDay ? (
                      <button 
                        onClick={() => handleDateClick(date)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 md:w-8 md:h-8 flex items-center justify-center rounded-full text-sm sm:text-lg md:text-sm cursor-pointer transition-all hover:scale-105 ${
                          isSelected ? 'bg-blue-100 border-2 border-blue-400 text-blue-700' : 
                          isToday ? 'font-bold text-red-500' : 
                          hasExpenses ? 'bg-red-50 text-gray-800 relative' :
                          day.getDay() === 0 ? 'text-red-500 hover:bg-red-50' : 
                          day.getDay() === 6 ? 'text-blue-500 hover:bg-blue-50' : 
                          'text-gray-800 hover:bg-gray-50'
                        } font-medium relative`}>
                        {date}
                        {hasExpenses && !isToday && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
                        )}
                      </button>
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-8 md:h-8 flex items-center justify-center text-sm sm:text-lg md:text-sm text-gray-400 font-medium">
                        {date}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Selected Date Expenses - Outside Card */}
        <div className="mt-4 bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          {selectedDate !== null ? (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2">
                <h4 className="text-sm font-semibold text-gray-800">{formatMonth(currentDate)} {selectedDate}日の支出</h4>
                <div className="flex items-center gap-2">
                  {expensesByDate[selectedDate] && expensesByDate[selectedDate].length > 0 && (
                    <div className="text-sm font-bold text-red-600">
                      合計: ¥{expensesByDate[selectedDate].reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
                    </div>
                  )}
                  {!showAddForm && (
                    <Button 
                      size="sm" 
                      onClick={() => setShowAddForm(true)}
                      className="bg-zaim-blue-500 hover:bg-zaim-blue-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      支出を追加
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Add Expense Form */}
              {showAddForm && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-4">
                  <div>
                    <Label htmlFor="amount">金額</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="1000"
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
                      <SelectTrigger className="mt-1 bg-white text-black border-gray-300 focus:ring-2 focus:ring-zaim-blue-400 focus:border-zaim-blue-400">
                        <SelectValue placeholder="カテゴリを選択" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id} className="text-black hover:bg-gray-100 cursor-pointer">
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
              
              {expensesByDate[selectedDate] && expensesByDate[selectedDate].length > 0 ? (
                <div className="space-y-1 sm:space-y-2 max-h-48 md:max-h-64 overflow-y-auto">
                  {expensesByDate[selectedDate].map((expense) => {
                const category = categories.find(cat => cat.id === expense.category_id);
                const IconComponent = getCategoryIcon(expense.category?.name || category?.name || 'その他', undefined, expense.category?.icon || category?.icon);
                const expenseTime = new Date(expense.created_at).toLocaleTimeString('ja-JP', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });
                
                return (
                  <div key={expense.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0" 
                           style={{ backgroundColor: category?.color || '#6b7280' }}>
                        <IconComponent className="h-3 w-3 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">{expense.description || category?.name || '支出'}</div>
                        <div className="text-xs text-gray-500">{expenseTime}</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-gray-900 flex-shrink-0 ml-2">¥{expense.amount.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-8">この日は支出がありません</div>
          )}
            </>
          ) : (
            <div className="text-sm text-gray-500 text-center py-8">日付を選択してください</div>
          )}
        </div>

      </div>
      <BottomNav currentPage="calendar" />
    </div>
  );
};

export default CalendarPage;