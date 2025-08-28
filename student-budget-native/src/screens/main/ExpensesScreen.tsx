import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

// 元のWebアプリと同じ型定義
interface ExpenseCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  created_at: string;
}

interface ExpenseWithCategory {
  id: string;
  user_id: string;
  amount: number;
  category_id: string;
  description?: string;
  date: string;
  source: 'manual' | 'paypay_csv' | 'bank_csv';
  created_at: string;
  updated_at: string;
  category: ExpenseCategory;
}

interface ExpenseForm {
  amount: string;
  category_id: string;
  description: string;
  date: string;
}

// アイコンマップ（元のWebアプリと同じ）
const iconMap = {
  "Utensils": "restaurant" as const,
  "Car": "car" as const,
  "ShoppingBag": "bag" as const,
  "BookOpen": "book" as const,
  "Shirt": "shirt" as const,
  "Home": "home" as const
};

export default function ExpensesScreen() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showingAllHistory, setShowingAllHistory] = useState(false);
  const [currentMonthTotal, setCurrentMonthTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const [newExpense, setNewExpense] = useState<ExpenseForm>({
    amount: "",
    category_id: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // カテゴリを取得
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // 今月の支出を取得（カテゴリ情報付き）
      const now = new Date();
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          category:expense_categories(*)
        `)
        .eq('user_id', user.id)
        .gte('date', `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`)
        .lt('date', `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}-01`)
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;
      setExpenses(expensesData || []);
      
      const total = (expensesData || []).reduce((sum, expense) => sum + expense.amount, 0);
      setCurrentMonthTotal(total);

    } catch (error) {
      console.error('Error loading expenses data:', error);
      Alert.alert('エラー', 'データの読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const loadAllHistory = async () => {
    if (!user || loading) return;

    setRefreshing(true);
    try {
      // 全ての支出を取得
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          category:expense_categories(*)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1000);

      if (expensesError) throw expensesError;
      setExpenses(expensesData || []);
      setShowingAllHistory(true);

    } catch (error) {
      console.error('Error loading all expenses:', error);
      Alert.alert('エラー', '支出履歴の読み込みに失敗しました。');
    } finally {
      setRefreshing(false);
    }
  };

  const backToCurrentMonth = () => {
    setShowingAllHistory(false);
    loadData();
  };

  const handleAddExpense = async () => {
    if (!user || !newExpense.amount || !newExpense.category_id || !newExpense.description) {
      Alert.alert('入力エラー', 'すべての項目を入力してください。');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          amount: parseInt(newExpense.amount),
          category_id: newExpense.category_id,
          description: newExpense.description,
          date: newExpense.date,
          source: 'manual'
        })
        .select();

      if (error) throw error;

      Alert.alert(
        '支出を追加しました',
        `¥${parseInt(newExpense.amount).toLocaleString()} - ${newExpense.description}`
      );

      // フォームをリセット
      setNewExpense({
        amount: "",
        category_id: "",
        description: "",
        date: new Date().toISOString().split('T')[0]
      });
      setSelectedCategory('');
      setShowAddForm(false);

      // データを再読み込み
      loadData();

    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('エラー', '支出の追加に失敗しました。');
    }
  };

  const deleteExpense = async (expenseId: string) => {
    Alert.alert(
      '支出を削除',
      'この支出を削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', expenseId);

              if (error) throw error;

              Alert.alert('成功', '支出を削除しました');
              loadData();

            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('エラー', '支出の削除に失敗しました。');
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  const getSelectedCategoryName = () => {
    if (!selectedCategory) return 'カテゴリを選択';
    const category = getCategoryById(selectedCategory);
    return category?.name || 'カテゴリを選択';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>データを読み込み中...</Text>
      </View>
    );
  }

  // カテゴリ別集計（今月のみ）
  const categoryBreakdown = categories.map(category => {
    const currentMonth = new Date();
    const currentMonthExpenses = expenses.filter(exp => {
      const expenseDate = new Date(exp.date);
      return exp.category_id === category.id && 
             expenseDate.getMonth() === currentMonth.getMonth() && 
             expenseDate.getFullYear() === currentMonth.getFullYear();
    });
    const amount = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    return { ...category, amount };
  }).filter(cat => cat.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 今月の支出合計カード */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryAmount}>¥{currentMonthTotal.toLocaleString()}</Text>
        <Text style={styles.summaryLabel}>今月の支出合計</Text>
      </View>

      {/* 支出追加ボタン */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Ionicons name="add-circle" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>手動で支出を記録</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.importButton}>
          <Ionicons name="cloud-upload" size={20} color="#FFF" />
          <Text style={styles.importButtonText}>PayPay CSVをインポート</Text>
        </TouchableOpacity>
      </View>

      {/* 支出追加フォーム */}
      {showAddForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>新しい支出を記録</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>金額</Text>
            <TextInput
              style={styles.formInput}
              placeholder="500"
              keyboardType="numeric"
              value={newExpense.amount}
              onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>カテゴリ</Text>
            <TouchableOpacity
              style={styles.categoryPicker}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text style={[styles.categoryPickerText, !selectedCategory && styles.placeholder]}>
                {getSelectedCategoryName()}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>説明</Text>
            <TextInput
              style={styles.formInput}
              placeholder="コンビニ弁当"
              value={newExpense.description}
              onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>日付</Text>
            <TextInput
              style={styles.formInput}
              value={newExpense.date}
              onChangeText={(text) => setNewExpense({ ...newExpense, date: text })}
            />
          </View>

          <View style={styles.formButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={handleAddExpense}>
              <Text style={styles.saveButtonText}>記録する</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddForm(false)}>
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 支出履歴 */}
      <View style={styles.historySection}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>
            {showingAllHistory ? "すべての支出履歴" : "今月の支出履歴"}
          </Text>
          {showingAllHistory && (
            <TouchableOpacity style={styles.backButton} onPress={backToCurrentMonth}>
              <Text style={styles.backButtonText}>今月に戻る</Text>
            </TouchableOpacity>
          )}
        </View>

        {expenses.map((expense, index) => {
          const category = expense.category;
          const iconName = category?.icon ? iconMap[category.icon as keyof typeof iconMap] || "home" : "home";
          const expenseDate = new Date(expense.date);
          const currentExpenseMonth = `${expenseDate.getFullYear()}年${expenseDate.getMonth() + 1}月`;
          
          // 月ヘッダーの表示判定
          const prevExpense = index > 0 ? expenses[index - 1] : null;
          const prevExpenseMonth = prevExpense ? 
            `${new Date(prevExpense.date).getFullYear()}年${new Date(prevExpense.date).getMonth() + 1}月` : null;
          const showMonthHeader = showingAllHistory && (!prevExpense || currentExpenseMonth !== prevExpenseMonth);
          
          return (
            <View key={expense.id}>
              {showMonthHeader && (
                <Text style={styles.monthHeader}>{currentExpenseMonth}</Text>
              )}
              <View style={styles.expenseCard}>
                <View style={styles.expenseContent}>
                  <View style={styles.expenseLeft}>
                    <View style={[styles.categoryIcon, { backgroundColor: category?.color || "#6b7280" }]}>
                      <Ionicons name={iconName} size={16} color="#FFF" />
                    </View>
                    <View style={styles.expenseInfo}>
                      <View style={styles.expenseAmountRow}>
                        <Text style={styles.expenseAmount}>¥{expense.amount.toLocaleString()}</Text>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>{category?.name || "未分類"}</Text>
                        </View>
                        {expense.source === 'paypay_csv' && (
                          <View style={styles.sourceBadge}>
                            <Ionicons name="document-text" size={10} color="#F59E0B" />
                            <Text style={styles.sourceBadgeText}>PayPay</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.expenseDescription}>{expense.description}</Text>
                      <View style={styles.expenseDate}>
                        <Ionicons name="calendar" size={12} color="#6B7280" />
                        <Text style={styles.expenseDateText}>{expense.date}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.expenseActions}>
                    <TouchableOpacity style={styles.editButton}>
                      <Ionicons name="create" size={16} color="#10B981" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => deleteExpense(expense.id)}
                    >
                      <Ionicons name="trash" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* カテゴリ別集計（今月のみ） */}
      {!showingAllHistory && (
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>今月のカテゴリ別集計</Text>
          {categoryBreakdown.map((category) => {
            const iconName = category.icon ? iconMap[category.icon as keyof typeof iconMap] || "home" : "home";
            return (
              <View key={category.id} style={styles.categoryItem}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryIcon, { backgroundColor: category.color || "#6b7280" }]}>
                    <Ionicons name={iconName} size={16} color="#FFF" />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <Text style={styles.categoryAmount}>¥{category.amount.toLocaleString()}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* 全履歴表示ボタン */}
      {!showingAllHistory && expenses.length > 0 && (
        <View style={styles.showAllSection}>
          <TouchableOpacity style={styles.showAllButton} onPress={loadAllHistory}>
            <Ionicons name="receipt" size={20} color="#FFF" />
            <Text style={styles.showAllButtonText}>これまでの支出記録を見る</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* カテゴリ選択モーダル */}
      <Modal visible={showCategoryPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>カテゴリを選択</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.categoryList}>
              {categories
                .sort((a, b) => {
                  if (a.name === '食費') return -1;
                  if (b.name === '食費') return 1;
                  if (a.name === 'その他') return 1;
                  if (b.name === 'その他') return -1;
                  return a.name.localeCompare(b.name);
                })
                .map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryOption}
                    onPress={() => {
                      setSelectedCategory(category.id);
                      setNewExpense({ ...newExpense, category_id: category.id });
                      setShowCategoryPicker(false);
                    }}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: category.color || "#6b7280" }]}>
                      <Ionicons 
                        name={category.icon ? iconMap[category.icon as keyof typeof iconMap] || "home" : "home"} 
                        size={16} 
                        color="#FFF" 
                      />
                    </View>
                    <Text style={styles.categoryOptionText}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },

  // サマリーカード
  summaryCard: {
    backgroundColor: '#EBF8FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    margin: 24,
    alignItems: 'center',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  // ボタンコンテナ
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  importButton: {
    flex: 1,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  importButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },

  // フォームカード
  formCard: {
    backgroundColor: '#FFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#000',
  },
  categoryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFF',
  },
  categoryPickerText: {
    fontSize: 16,
    color: '#000',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '500',
  },

  // 履歴セクション
  historySection: {
    paddingHorizontal: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  backButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  backButtonText: {
    color: '#10B981',
    fontSize: 12,
  },
  monthHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 24,
    marginBottom: 8,
    paddingLeft: 8,
  },

  // 支出カード
  expenseCard: {
    backgroundColor: '#FFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  expenseContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  categoryBadge: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#10B981',
  },
  sourceBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sourceBadgeText: {
    fontSize: 10,
    color: '#F59E0B',
  },
  expenseDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  expenseDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expenseDateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  expenseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 4,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 4,
  },

  // カテゴリセクション
  categorySection: {
    backgroundColor: '#FFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 24,
    marginTop: 24,
    overflow: 'hidden',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },

  // 全履歴表示セクション
  showAllSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  showAllButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  showAllButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },

  // モーダル
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  categoryList: {
    padding: 16,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#000',
  },
});