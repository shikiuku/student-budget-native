'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Utensils, Car, ShoppingBag, Home, BookOpen, Shirt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/bottom-nav';
import { useAuth } from "@/components/auth-provider";
import { userProfileService, expenseService, expenseCategoryService } from "@/lib/database";
import type { UserProfile, ExpenseWithCategory, ExpenseCategory } from "@/lib/types";

const CalendarPage = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date().getDate());
  const [isClient, setIsClient] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [monthlyBudget, setMonthlyBudget] = useState(30000);
  const [spent, setSpent] = useState(0);
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  const iconMap = {
    "Utensils": Utensils,
    "Car": Car,
    "ShoppingBag": ShoppingBag,
    "BookOpen": BookOpen,
    "Shirt": Home,
    "Home": Home
  };

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
      loadUserData();
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
      }

      // Load current month expenses
      const expensesResult = await expenseService.getExpensesByMonth(user.id, currentDate.getFullYear(), currentDate.getMonth() + 1);
      if (expensesResult.success && expensesResult.data) {
        setExpenses(expensesResult.data);
        const total = expensesResult.data.reduce((sum, expense) => sum + expense.amount, 0);
        setSpent(total);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // 実際の支出データを日付ごとにグループ化
  const getExpensesByDate = () => {
    const expensesByDate: { [key: number]: ExpenseWithCategory[] } = {};
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getMonth() === currentDate.getMonth() && 
          expenseDate.getFullYear() === currentDate.getFullYear()) {
        const day = expenseDate.getDate();
        if (!expensesByDate[day]) {
          expensesByDate[day] = [];
        }
        expensesByDate[day].push(expense);
      }
    });
    
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
    return expenses[dateStr];
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const handleDateClick = (date: number) => {
    setSelectedDate(date);
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
        {/* Monthly Summary Cards */}
        <div className="mb-4 sm:mb-6 md:mb-2 grid grid-cols-3 gap-2 sm:gap-4 md:gap-2">
          <div className="bg-blue-50 p-3 sm:p-4 md:p-3 rounded-lg text-center">
            <div className="text-xs sm:text-sm text-gray-600 mb-1 md:mb-0">収入</div>
            <div className="text-sm sm:text-xl md:text-lg font-bold text-blue-600">¥{monthlyIncome.toLocaleString()}</div>
          </div>
          <div className="bg-red-50 p-3 sm:p-4 md:p-3 rounded-lg text-center">
            <div className="text-xs sm:text-sm text-gray-600 mb-1 md:mb-0">支出</div>
            <div className="text-sm sm:text-xl md:text-lg font-bold text-red-600">¥{monthlyExpenses.toLocaleString()}</div>
          </div>
          <div className="bg-green-50 p-3 sm:p-4 md:p-3 rounded-lg text-center">
            <div className="text-xs sm:text-sm text-gray-600 mb-1 md:mb-0">残高</div>
            <div className="text-sm sm:text-xl md:text-lg font-bold text-green-600">¥{balance.toLocaleString()}</div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6 md:p-3">
          {/* Calendar Header */}
          <div className="mb-3 sm:mb-4 md:mb-2 flex items-center justify-center gap-1 sm:gap-2">
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

          {/* Calendar */}
          <div className="mb-3 sm:mb-6 md:mb-2">
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
                const isSelected = isCurrentMonthDay && date === selectedDate;
                
                return (
                  <div key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`} className="text-center py-1 sm:py-2 md:py-0 h-10 sm:h-14 md:h-9 flex items-center justify-center">
                    {isCurrentMonthDay ? (
                      <button 
                        onClick={() => handleDateClick(date)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 md:w-8 md:h-8 flex items-center justify-center rounded-full text-sm sm:text-lg md:text-sm cursor-pointer transition-all hover:scale-105 ${
                          isSelected ? 'bg-blue-100 border-2 border-blue-400 text-blue-700' : 
                          isToday ? 'font-bold text-gray-800' : 
                          hasExpenses ? 'bg-blue-50 text-blue-700' :
                          day.getDay() === 0 ? 'text-red-500 hover:bg-red-50' : 
                          day.getDay() === 6 ? 'text-blue-500 hover:bg-blue-50' : 
                          'text-gray-700 hover:bg-gray-100'
                        } font-medium relative`}>
                        {date}
                        {hasExpenses && (
                          <div className="absolute -bottom-1 sm:bottom-0 text-xs text-blue-600 font-bold">
                            •
                          </div>
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
          
          {/* Selected Date Expenses */}
          <div className="border-t border-gray-200 pt-2 sm:pt-3 md:pt-2 min-h-[200px] md:max-h-[200px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 md:mb-1 gap-2">
              <h4 className="text-sm font-semibold text-gray-800">{formatMonth(currentDate)} {selectedDate}日の支出</h4>
              {expensesByDate[selectedDate] && expensesByDate[selectedDate].length > 0 && (
                <div className="text-sm font-bold text-red-600">
                  合計: ¥{expensesByDate[selectedDate].reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
                </div>
              )}
            </div>
            
            {expensesByDate[selectedDate] && expensesByDate[selectedDate].length > 0 ? (
              <div className="space-y-1 sm:space-y-2 max-h-48 md:max-h-40 overflow-y-auto">
                {expensesByDate[selectedDate].map((expense) => {
                  const category = categories.find(cat => cat.id === expense.category_id);
                  const IconComponent = category?.icon ? iconMap[category.icon as keyof typeof iconMap] || Home : Home;
                  const expenseTime = new Date(expense.created_at).toLocaleTimeString('ja-JP', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                  
                  return (
                    <div key={expense.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 md:py-1 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 rounded-full flex items-center justify-center flex-shrink-0" 
                             style={{ backgroundColor: category?.color || '#6b7280' }}>
                          <IconComponent className="h-3 w-3 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm md:text-xs font-medium text-gray-900 truncate">{expense.description || category?.name || '支出'}</div>
                          <div className="text-xs md:text-[10px] text-gray-500">{expenseTime}</div>
                        </div>
                      </div>
                      <div className="text-sm md:text-xs font-bold text-gray-900 flex-shrink-0 ml-2">¥{expense.amount.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-3 md:py-8">この日は支出がありません</div>
            )}
          </div>
        </div>

      </div>
      <BottomNav currentPage="calendar" />
    </div>
  );
};

export default CalendarPage;