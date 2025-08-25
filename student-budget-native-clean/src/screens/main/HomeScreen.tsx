import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import Svg, { Circle } from 'react-native-svg';

// 元のWebアプリと同じ型定義
interface UserProfile {
  id: string;
  name?: string;
  age?: number;
  school_type?: 'middle_school' | 'high_school' | 'vocational_school' | 'university';
  prefecture?: string;
  city?: string;
  school_name?: string;
  grade?: string;
  monthly_budget?: number;
  savings_balance?: number;
  created_at: string;
  updated_at: string;
}

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

// アイコンマップ（元のWebアプリと同じ）
const iconMap = {
  "Utensils": "restaurant" as const,
  "Car": "car" as const,
  "ShoppingBag": "bag" as const,
  "BookOpen": "book" as const,
  "Shirt": "shirt" as const,
  "Home": "home" as const
};

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
      checkMonthEndSavings();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // ユーザープロファイルを取得
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profile);

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

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMonthEndSavings = async () => {
    // 月末自動貯金機能（元のWebアプリと同じロジック）
    if (!user) return;

    try {
      const now = new Date();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      if (now.getDate() === lastDay.getDate()) {
        // AsyncStorageで実装するか、Supabaseに貯金フラグテーブルを追加する必要がある
        console.log('月末貯金チェック機能（実装予定）');
      }
    } catch (error) {
      console.error('月末貯金チェックエラー:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>データを読み込み中...</Text>
      </View>
    );
  }

  // 計算ロジック（元のWebアプリと同じ）
  const monthlyBudget = userProfile?.monthly_budget || 15000;
  const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = monthlyBudget - spent;
  const spentPercentage = monthlyBudget > 0 ? (spent / monthlyBudget) * 100 : 0;

  // カテゴリ別の内訳計算
  const categoryBreakdown = categories.map(category => {
    const categoryExpenses = expenses.filter(exp => exp.category_id === category.id);
    const amount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const percentage = spent > 0 ? Math.round((amount / spent) * 100) : 0;
    
    return {
      name: category.name,
      amount,
      icon: category.icon || "Home",
      color: category.color || "#6b7280",
      percentage
    };
  }).filter(cat => cat.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // 予算ステータスの色分け（Zaim風）
  const getBudgetStatus = () => {
    if (spentPercentage <= 60) return { 
      color: '#10B981', 
      bgColor: '#ECFDF5', 
      borderColor: '#10B981', 
      status: '余裕あり' 
    };
    if (spentPercentage <= 80) return { 
      color: '#F59E0B', 
      bgColor: '#FFFBEB', 
      borderColor: '#F59E0B', 
      status: '注意' 
    };
    return { 
      color: '#EF4444', 
      bgColor: '#FEF2F2', 
      borderColor: '#EF4444', 
      status: spentPercentage > 100 ? '予算オーバー' : '要注意' 
    };
  };

  const budgetStatus = getBudgetStatus();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      {/* メイン予算ステータス（元のWebアプリと同じデザイン） */}
      <View style={[styles.budgetCard, { backgroundColor: budgetStatus.bgColor, borderColor: budgetStatus.borderColor }]}>
        <View style={styles.budgetHeader}>
          <View style={styles.budgetStatusRow}>
            <View style={[styles.statusDot, { backgroundColor: budgetStatus.color }]} />
            <Text style={[styles.statusText, { color: budgetStatus.color }]}>
              {budgetStatus.status}
            </Text>
          </View>
        </View>

        <View style={styles.budgetAmounts}>
          <View style={styles.budgetMain}>
            <Text style={[styles.remainingAmount, { color: spentPercentage > 100 ? '#EF4444' : '#000' }]}>
              {spentPercentage > 100 ? '-' : ''}¥{Math.abs(remaining).toLocaleString()}
            </Text>
            <Text style={styles.remainingLabel}>今月使える金額</Text>
            
            <View style={styles.budgetProgress}>
              <View style={styles.budgetProgressRow}>
                <Text style={styles.budgetProgressText}>
                  予算 ¥{monthlyBudget.toLocaleString()}
                </Text>
                <Text style={styles.budgetProgressText}>
                  使用 {spentPercentage.toFixed(0)}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(spentPercentage, 100)}%`,
                      backgroundColor: budgetStatus.color 
                    }
                  ]} 
                />
              </View>
            </View>
          </View>

          <View style={[styles.savingsSection, { borderColor: budgetStatus.borderColor }]}>
            <Text style={styles.savingsLabel}>貯金残高</Text>
            <Text style={styles.savingsAmount}>¥{(userProfile?.savings_balance || 0).toLocaleString()}</Text>
            <View style={styles.savingsNote}>
              <Text style={styles.savingsNoteText}>月末に余った予算を自動追加</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 収支リスト */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>収支</Text>
        </View>
        <View style={styles.incomeExpenseList}>
          <View style={styles.incomeExpenseItem}>
            <View style={styles.incomeExpenseLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#E0F2E0' }]}>
                <Ionicons name="trending-up" size={16} color="#5A9C5A" />
              </View>
              <Text style={styles.incomeExpenseLabel}>収入</Text>
            </View>
            <Text style={styles.incomeExpenseAmount}>¥{monthlyBudget.toLocaleString()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.incomeExpenseItem}>
            <View style={styles.incomeExpenseLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#F9E0E0' }]}>
                <Ionicons name="trending-down" size={16} color="#CC5A5A" />
              </View>
              <Text style={styles.incomeExpenseLabel}>支出</Text>
            </View>
            <Text style={styles.incomeExpenseAmount}>¥{spent.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* ドーナツチャート */}
      {categoryBreakdown.length > 0 && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>支出内訳</Text>
          </View>
          <View style={styles.chartContainer}>
            <View style={styles.chartArea}>
              {/* SVGドーナツチャート（元のWebアプリと同じ） */}
              <View style={styles.svgContainer}>
                <Svg width={192} height={192} viewBox="0 0 200 200">
                  {categoryBreakdown.map((category, index) => {
                    const prevPercentage = categoryBreakdown.slice(0, index).reduce((sum, cat) => sum + cat.percentage, 0);
                    const circumference = 502.65; // 2 * π * 80
                    const strokeDasharray = `${category.percentage * 5.03} ${circumference}`;
                    const strokeDashoffset = `-${prevPercentage * 5.03}`;
                    
                    return (
                      <Circle
                        key={category.name}
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke={category.color}
                        strokeWidth="16"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 100 100)"
                      />
                    );
                  })}
                </Svg>
                <View style={styles.chartCenter}>
                  <Text style={styles.chartTotalAmount}>¥{spent.toLocaleString()}</Text>
                  <Text style={styles.chartTotalLabel}>合計支出</Text>
                </View>
              </View>
            </View>
            <View style={styles.chartLegend}>
              {categoryBreakdown.map((category) => (
                <View key={category.name} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: category.color }]} />
                  <Text style={styles.legendName}>{category.name}</Text>
                  <Text style={styles.legendPercentage}>{category.percentage}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* カテゴリ別支出リスト */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>カテゴリ別支出</Text>
        </View>
        <View style={styles.categoryList}>
          {categoryBreakdown.length > 0 ? categoryBreakdown.map((category, index) => (
            <View key={category.name}>
              <View style={styles.categoryItem}>
                <View style={styles.categoryLeft}>
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Ionicons 
                      name={iconMap[category.icon as keyof typeof iconMap] || "home"} 
                      size={16} 
                      color="#FFF" 
                    />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <Text style={styles.categoryAmount}>¥{category.amount.toLocaleString()}</Text>
              </View>
              {index < categoryBreakdown.length - 1 && <View style={styles.divider} />}
            </View>
          )) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>まだ支出データがありません</Text>
            </View>
          )}
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
  
  // メイン予算ステータスカード（元のWebアプリのデザイン）
  budgetCard: {
    margin: 24,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  budgetHeader: {
    marginBottom: 12,
  },
  budgetStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
  },
  
  budgetAmounts: {
    flexDirection: 'row',
    gap: 24,
  },
  budgetMain: {
    flex: 2,
    paddingRight: 12,
  },
  remainingAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  remainingLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  budgetProgress: {
    gap: 4,
  },
  budgetProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetProgressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  
  savingsSection: {
    flex: 1,
    borderLeftWidth: 2,
    paddingLeft: 24,
    gap: 12,
  },
  savingsLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  savingsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  savingsNote: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  savingsNoteText: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  // セクションカード
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  sectionHeader: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  
  // 収支リスト
  incomeExpenseList: {
    padding: 0,
  },
  incomeExpenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  incomeExpenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomeExpenseLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  incomeExpenseAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  
  // チャートエリア
  chartContainer: {
    padding: 24,
    alignItems: 'center',
  },
  chartArea: {
    marginBottom: 16,
  },
  svgContainer: {
    position: 'relative',
    width: 192,
    height: 192,
    marginBottom: 16,
  },
  chartCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  chartTotalLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  chartLegend: {
    alignItems: 'center',
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    minWidth: 60,
  },
  legendPercentage: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  // カテゴリリスト
  categoryList: {
    padding: 0,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  
  // エンプティステート
  emptyState: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
});