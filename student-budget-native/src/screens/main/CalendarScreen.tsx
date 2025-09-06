import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { getCategoryIcon, getCategoryColor, getCategoryBackgroundColor } from '../../utils/categoryIcons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

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


export default function CalendarScreen() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
  });

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

  const handleAddExpense = async () => {
    if (!user || !newExpense.amount || !newExpense.category_id) {
      Alert.alert('エラー', '金額とカテゴリーを入力してください。');
      return;
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          amount: parseInt(newExpense.amount),
          description: newExpense.description || null,
          category_id: newExpense.category_id,
          date: newExpense.date,
        });

      if (error) {
        throw error;
      }

      // データを再読み込み
      await loadData();
      
      // フォームリセット
      setNewExpense({
        amount: '',
        description: '',
        category_id: '',
        date: new Date().toISOString().split('T')[0],
      });
      
      setShowAddModal(false);
      Alert.alert('成功', '支出を記録しました。');
    } catch (error) {
      console.error('支出追加エラー:', error);
      Alert.alert('エラー', '支出の記録に失敗しました。');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.zaimBlue[500]} />
        <Text style={styles.loadingText}>データを読み込み中...</Text>
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
                  isTodayDate && styles.todayDay,
                  isSelected && styles.selectedDay,
                ]}>
                  <Text style={[
                    styles.dayText,
                    !isCurrentMonthDay && styles.disabledDayText,
                    day.getDay() === 0 && isCurrentMonthDay && !isTodayDate && styles.sundayText,
                    day.getDay() === 6 && isCurrentMonthDay && !isTodayDate && styles.saturdayText,
                    isTodayDate && !isSelected && styles.todayText,
                    isSelected && styles.selectedDayText,
                  ]}>
                    {date}
                  </Text>
                  {hasExpenses && !isTodayDate && !isSelected && (
                    <View style={styles.expenseDot} />
                  )}
                  {isTodayDate && !isSelected && (
                    <View style={styles.todayDot} />
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
              <View style={styles.detailsRight}>
                {expensesByDate[selectedDate] && expensesByDate[selectedDate].length > 0 && (
                  <Text style={styles.detailsTotal}>
                    合計: ¥{expensesByDate[selectedDate].reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
                  </Text>
                )}
                {!showAddForm && (
                  <TouchableOpacity
                    style={styles.addExpenseButton}
                    onPress={() => setShowAddForm(true)}
                  >
                    <Ionicons name="add" size={16} color={Colors.white} />
                    <Text style={styles.addExpenseButtonText}>支出を追加</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* 支出追加フォーム */}
            {showAddForm && (
              <View style={styles.addForm}>
                <View style={styles.formRow}>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>金額</Text>
                    <TextInput
                      style={styles.formInput}
                      value={newExpense.amount}
                      onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
                      placeholder="1000"
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>カテゴリ</Text>
                    <TouchableOpacity
                      style={styles.categorySelect}
                      onPress={() => setShowAddModal(true)}
                    >
                      <Text style={[styles.categorySelectText, !newExpense.category_id && styles.placeholder]}>
                        {newExpense.category_id ? 
                          categories.find(c => c.id === newExpense.category_id)?.name || 'カテゴリを選択' : 
                          'カテゴリを選択'
                        }
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={Colors.gray[500]} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>説明</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newExpense.description}
                    onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
                    placeholder="コンビニ弁当"
                  />
                </View>

                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.saveButton} onPress={handleAddExpense}>
                    <Text style={styles.saveButtonText}>記録する</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddForm(false)}>
                    <Text style={styles.cancelButtonText}>キャンセル</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {expensesByDate[selectedDate] && expensesByDate[selectedDate].length > 0 ? (
              <ScrollView style={styles.expensesList}>
                {expensesByDate[selectedDate].map((expense) => {
                  const category = expense.category || categories.find(cat => cat.id === expense.category_id);
                  const iconName = getCategoryIcon(category?.icon || category?.name || 'その他');
                  const expenseTime = new Date(expense.created_at).toLocaleTimeString('ja-JP', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                  
                  return (
                    <View key={expense.id} style={styles.expenseItem}>
                      <View style={styles.expenseInfo}>
                        <View style={[
                          styles.categoryIcon,
                          { backgroundColor: getCategoryBackgroundColor(category?.name || 'その他') }
                        ]}>
                          <Ionicons name={iconName} size={16} color={getCategoryColor(category?.name || 'その他')} />
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


      {/* 支出追加モーダル */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>支出を追加</Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>金額 *</Text>
              <TextInput
                style={styles.textInput}
                value={newExpense.amount}
                onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
                placeholder="1000"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>説明</Text>
              <TextInput
                style={styles.textInput}
                value={newExpense.description}
                onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
                placeholder="ランチ代など"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>カテゴリー *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
                {categories.map((category) => {
                  const iconName = getCategoryIcon(category.icon || category.name || 'その他');
                  const isSelected = newExpense.category_id === category.id;
                  
                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryItem,
                        isSelected && styles.selectedCategoryItem
                      ]}
                      onPress={() => setNewExpense({ ...newExpense, category_id: category.id })}
                    >
                      <View style={[
                        styles.categoryIconContainer,
                        { backgroundColor: getCategoryBackgroundColor(category.name || 'その他') },
                        isSelected && styles.selectedCategoryIcon
                      ]}>
                        <Ionicons name={iconName} size={20} color={getCategoryColor(category.name || 'その他')} />
                      </View>
                      <Text style={[
                        styles.categoryName,
                        isSelected && styles.selectedCategoryName
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>日付</Text>
              <TextInput
                style={styles.textInput}
                value={newExpense.date}
                onChangeText={(text) => setNewExpense({ ...newExpense, date: text })}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.modalCancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleAddExpense}
            >
              <Text style={styles.modalSaveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
  },
  // 月ナビゲーション
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.white,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  navButton: {
    padding: 8,
    borderRadius: 4,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Fonts.semibold,
    color: Colors.black,
    marginHorizontal: 20,
    minWidth: 180,
    textAlign: 'center',
  },

  // 月次サマリー
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  summaryCard: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  incomeCard: {
    backgroundColor: Colors.success[50],
  },
  expenseCard: {
    backgroundColor: Colors.error[50],
  },
  balanceCard: {
    backgroundColor: Colors.success[50],
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.gray[600],
    marginBottom: 4,
  },
  incomeAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    color: Colors.success[600],
  },
  expenseAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    color: Colors.error[600],
  },
  balanceAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    color: Colors.success[600],
  },

  // カレンダーコンテナ
  calendarContainer: {
    backgroundColor: Colors.white,
    margin: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    padding: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  // カレンダーヘッダー
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: Fonts.medium,
    color: Colors.gray[600],
  },
  sundayText: {
    color: Colors.error[500],
  },
  saturdayText: {
    color: Colors.zaimBlue[500],
  },

  // カレンダーグリッド
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  calendarDay: {
    width: '13.8%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayContent: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: Colors.zaimBlue[100],
    borderWidth: 2,
    borderColor: Colors.zaimBlue[500],
  },
  todayDay: {
    backgroundColor: 'transparent',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Fonts.medium,
    color: Colors.black,
  },
  disabledDayText: {
    color: Colors.gray[300],
  },
  todayText: {
    color: Colors.error[500],
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
  },
  selectedDayText: {
    color: Colors.zaimBlue[700],
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
  },
  // カレンダーの点
  expenseDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    backgroundColor: Colors.error[500],
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  todayDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    backgroundColor: Colors.success[500],
    borderRadius: 2,
  },

  // 支出詳細エリア
  expenseDetails: {
    backgroundColor: Colors.white,
    margin: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    padding: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.semibold,
    color: Colors.black,
  },
  detailsTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    color: Colors.error[600],
  },

  // 支出追加ボタン（支出ページと同じ灰色）
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#64748B', // 支出ページと同じslate-500色
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  addExpenseButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
    fontFamily: Fonts.medium,
  },

  // 支出追加フォーム
  addForm: {
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formGroup: {
    flex: 1,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: Fonts.medium,
    color: Colors.gray[700],
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.black,
  },
  categorySelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categorySelectText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.black,
  },
  placeholder: {
    color: Colors.gray[400],
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.zaimBlue[500],
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Fonts.medium,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.zaimBlue[200],
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.zaimBlue[600],
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Fonts.medium,
  },
  // 支出リスト
  expensesList: {
    maxHeight: 200,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
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
    fontSize: 13,
    fontWeight: '500',
    fontFamily: Fonts.medium,
    color: Colors.black,
  },
  expenseTime: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    color: Colors.black,
  },
  noExpensesText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
    textAlign: 'center',
    paddingVertical: 24,
  },
  noSelectionText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
    textAlign: 'center',
    paddingVertical: 24,
  },
  // モーダル
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Fonts.semibold,
    color: Colors.black,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Fonts.medium,
    color: Colors.gray[700],
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: Fonts.regular,
    backgroundColor: Colors.gray[50],
    color: Colors.black,
  },
  // カテゴリ選択リスト
  categoryList: {
    flexDirection: 'row',
    marginTop: 8,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 8,
    width: 60,
    minHeight: 80,
  },
  selectedCategoryItem: {
    backgroundColor: Colors.zaimBlue[50],
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectedCategoryIcon: {
    borderWidth: 2,
    borderColor: Colors.zaimBlue[500],
  },
  categoryName: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.gray[600],
    textAlign: 'center',
    flexWrap: 'wrap',
    lineHeight: 14,
  },
  selectedCategoryName: {
    color: Colors.zaimBlue[600],
    fontWeight: '500',
    fontFamily: Fonts.medium,
  },

  // モーダルフッター
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.gray[600],
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.success[500],
    alignItems: 'center',
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.semibold,
    color: Colors.white,
  },
});