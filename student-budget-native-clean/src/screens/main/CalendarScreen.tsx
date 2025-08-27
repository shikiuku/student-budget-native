import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

interface UserProfile {
  id: string;
  name: string;
  age: number;
  grade: string;
  prefecture: string;
  school_name?: string;
  monthly_budget: number;
  savings_balance: number;
  school_type: string;
  created_at: string;
  updated_at: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Expense {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description?: string;
  date: string;
  created_at: string;
  category?: ExpenseCategory;
}

const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  'restaurant': 'restaurant',
  'car': 'car',
  'bag': 'bag',
  'book': 'book',
  'home': 'home',
  'shirt': 'shirt',
};

export default function CalendarScreen() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const monthlyBudget = userProfile?.monthly_budget || 30000;
  const monthlyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = monthlyBudget - monthlyExpenses;

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, currentDate]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // ユーザープロフィール取得
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
      }

      // カテゴリ取得
      const { data: categoriesData } = await supabase
        .from('expense_categories')
        .select('*');

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // 現在の月の支出データ取得
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

      const { data: expensesData } = await supabase
        .from('expenses')
        .select(`
          *,
          category:expense_categories(*)
        `)
        .eq('user_id', user.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)
        .order('date', { ascending: false });

      if (expensesData) {
        setExpenses(expensesData);
      }
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // カレンダー表示用の日付生成
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 月の最初の日と最後の日
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // カレンダーの開始日（前月の日曜日から）
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // カレンダーの終了日（翌月の土曜日まで）
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // 支出データを日付ごとにグループ化
  const getExpensesByDate = () => {
    const expensesByDate: { [key: number]: Expense[] } = {};
    
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
  const calendarDays = generateCalendarDays();

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const handleDateClick = (date: number) => {
    setSelectedDate(date === selectedDate ? null : date);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 月ナビゲーション */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity
          onPress={() => changeMonth(-1)}
          style={styles.navButton}
        >
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
        
        <Text style={styles.monthText}>{formatMonth(currentDate)}</Text>
        
        <TouchableOpacity
          onPress={() => changeMonth(1)}
          style={styles.navButton}
        >
          <Ionicons name="chevron-forward" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* 月次サマリー */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <Text style={styles.summaryLabel}>収入</Text>
          <Text style={styles.incomeAmount}>¥{monthlyBudget.toLocaleString()}</Text>
        </View>
        <View style={[styles.summaryCard, styles.expenseCard]}>
          <Text style={styles.summaryLabel}>支出</Text>
          <Text style={styles.expenseAmount}>¥{monthlyExpenses.toLocaleString()}</Text>
        </View>
        <View style={[styles.summaryCard, styles.balanceCard]}>
          <Text style={styles.summaryLabel}>残高</Text>
          <Text style={styles.balanceAmount}>¥{balance.toLocaleString()}</Text>
        </View>
      </View>

      {/* カレンダー */}
      <View style={styles.calendarContainer}>
        {/* 曜日ヘッダー */}
        <View style={styles.weekHeader}>
          {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
            <View key={day} style={styles.weekDay}>
              <Text style={[
                styles.weekDayText,
                i === 0 && styles.sundayText,
                i === 6 && styles.saturdayText,
              ]}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* カレンダーグリッド */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, i) => {
            const date = day.getDate();
            const isCurrentMonthDay = isCurrentMonth(day);
            const isTodayDate = isToday(day);
            const hasExpenses = isCurrentMonthDay && expensesByDate[date] && expensesByDate[date].length > 0;
            const isSelected = isCurrentMonthDay && selectedDate === date;
            
            return (
              <TouchableOpacity
                key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                style={styles.calendarDay}
                onPress={() => isCurrentMonthDay && handleDateClick(date)}
                disabled={!isCurrentMonthDay}
              >
                <View style={[
                  styles.dayContent,
                  isSelected && styles.selectedDay,
                  isTodayDate && styles.todayDay,
                ]}>
                  <Text style={[
                    styles.dayText,
                    !isCurrentMonthDay && styles.disabledDayText,
                    isTodayDate && styles.todayText,
                    isSelected && styles.selectedDayText,
                    day.getDay() === 0 && isCurrentMonthDay && styles.sundayText,
                    day.getDay() === 6 && isCurrentMonthDay && styles.saturdayText,
                  ]}>
                    {date}
                  </Text>
                  {hasExpenses && !isTodayDate && !isSelected && (
                    <View style={styles.expenseDot} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 選択した日の支出詳細 */}
      <View style={styles.expenseDetails}>
        {selectedDate !== null ? (
          <>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>
                {formatMonth(currentDate)} {selectedDate}日の支出
              </Text>
              {expensesByDate[selectedDate] && expensesByDate[selectedDate].length > 0 && (
                <Text style={styles.detailsTotal}>
                  合計: ¥{expensesByDate[selectedDate].reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
                </Text>
              )}
            </View>
            
            {expensesByDate[selectedDate] && expensesByDate[selectedDate].length > 0 ? (
              <ScrollView style={styles.expensesList}>
                {expensesByDate[selectedDate].map((expense) => {
                  const category = expense.category || categories.find(cat => cat.id === expense.category_id);
                  const iconName = category?.icon ? iconMap[category.icon] || 'home' : 'home';
                  const expenseTime = new Date(expense.created_at).toLocaleTimeString('ja-JP', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                  
                  return (
                    <View key={expense.id} style={styles.expenseItem}>
                      <View style={styles.expenseInfo}>
                        <View style={[
                          styles.categoryIcon,
                          { backgroundColor: category?.color || '#6B7280' }
                        ]}>
                          <Ionicons name={iconName} size={16} color="white" />
                        </View>
                        <View style={styles.expenseTextInfo}>
                          <Text style={styles.expenseDescription}>
                            {expense.description || category?.name || '支出'}
                          </Text>
                          <Text style={styles.expenseTime}>{expenseTime}</Text>
                        </View>
                      </View>
                      <Text style={styles.expenseAmount}>
                        ¥{expense.amount.toLocaleString()}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={styles.noExpensesText}>この日は支出がありません</Text>
            )}
          </>
        ) : (
          <Text style={styles.noSelectionText}>日付を選択してください</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 24,
    minWidth: 200,
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  incomeCard: {
    backgroundColor: '#EBF8FF',
  },
  expenseCard: {
    backgroundColor: '#FEF2F2',
  },
  balanceCard: {
    backgroundColor: '#F0FDF4',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  incomeAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
  },
  calendarContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  sundayText: {
    color: '#DC2626',
  },
  saturdayText: {
    color: '#2563EB',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  dayContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: '#EBF8FF',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  todayDay: {
    backgroundColor: '#FEF2F2',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  disabledDayText: {
    color: '#D1D5DB',
  },
  todayText: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  selectedDayText: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  expenseDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    backgroundColor: '#DC2626',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'white',
  },
  expenseDetails: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  detailsTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  expensesList: {
    maxHeight: 200,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseTextInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  expenseTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  noExpensesText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 32,
  },
  noSelectionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 32,
  },
});