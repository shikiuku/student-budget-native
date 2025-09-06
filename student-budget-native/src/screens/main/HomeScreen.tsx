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
import { getCategoryIcon, getCategoryColor } from '../../utils/categoryIcons';
import { Colors, getCategoryColor as getNewCategoryColor, getCategoryBackgroundColor } from '../../constants/colors';
import { Fonts, getFontFamily } from '../../constants/fonts';

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
        <ActivityIndicator size="large" color={Colors.zaimBlue[400]} />
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
      icon: category.icon || category.name,
      color: getNewCategoryColor(category.name) || "#6b7280",
      percentage
    };
  }).filter(cat => cat.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // 予算ステータスの色分け（Zaim風）
  const getBudgetStatus = () => {
    if (spentPercentage <= 60) return { 
      color: Colors.zaimBlue[400], 
      bgColor: Colors.success[50], 
      borderColor: Colors.zaimBlue[400], 
      status: '余裕あり' 
    };
    if (spentPercentage <= 80) return { 
      color: Colors.warning[500], 
      bgColor: Colors.warning[50], 
      borderColor: Colors.warning[500], 
      status: '注意' 
    };
    return { 
      color: Colors.error[500], 
      bgColor: Colors.error[50], 
      borderColor: Colors.error[500], 
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

      {/* Web版レイアウト: 収支 + 支出内訳を横並び */}
      <View style={styles.horizontalContainer}>
        {/* 収支リスト */}
        <View style={[styles.sectionCard, styles.halfWidthCard]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>収支</Text>
          </View>
          <View style={styles.incomeExpenseList}>
            <View style={styles.incomeExpenseItem}>
              <View style={styles.incomeExpenseLeft}>
                <View style={[styles.iconCircle, { backgroundColor: Colors.success[100] }]}>
                  <Ionicons name="trending-up" size={16} color={Colors.success[600]} />
                </View>
                <Text style={styles.incomeExpenseLabel}>収入</Text>
              </View>
              <Text style={styles.incomeExpenseAmount}>¥{monthlyBudget.toLocaleString()}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.incomeExpenseItem}>
              <View style={styles.incomeExpenseLeft}>
                <View style={[styles.iconCircle, { backgroundColor: Colors.error[100] }]}>
                  <Ionicons name="trending-down" size={16} color={Colors.error[600]} />
                </View>
                <Text style={styles.incomeExpenseLabel}>支出</Text>
              </View>
              <Text style={styles.incomeExpenseAmount}>¥{spent.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* 支出内訳（ドーナツチャート - Web版と同じ横並び配置） */}
        {categoryBreakdown.length > 0 && (
          <View style={[styles.sectionCard, styles.halfWidthCard]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>支出内訳</Text>
            </View>
            <View style={styles.donutChartContainer}>
              <View style={styles.donutChartSection}>
                <View style={styles.donutChartWrapper}>
                  <Svg width={150} height={150} viewBox="0 0 200 200" style={{ transform: [{ rotate: '-90deg' }] }}>
                    {categoryBreakdown.map((category, index) => {
                      const prevPercentage = categoryBreakdown.slice(0, index).reduce((sum, cat) => sum + cat.percentage, 0);
                      const strokeDasharray = `${category.percentage * 5.03} 502.65`;
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
                        />
                      );
                    })}
                  </Svg>
                  <View style={styles.donutChartCenter}>
                    <Text style={styles.donutChartAmountSmall}>¥{spent.toLocaleString()}</Text>
                    <Text style={styles.donutChartLabelSmall}>合計支出</Text>
                  </View>
                </View>
                <View style={styles.donutChartLegendCompact}>
                  {categoryBreakdown.slice(0, 3).map((category) => (
                    <View key={category.name} style={styles.donutLegendItemCompact}>
                      <View style={[styles.donutLegendColorSmall, { backgroundColor: category.color }]} />
                      <Text style={styles.donutLegendTextSmall}>{category.name}</Text>
                      <Text style={styles.donutLegendPercentSmall}>{category.percentage}%</Text>
                    </View>
                  ))}
                  {categoryBreakdown.length > 3 && (
                    <Text style={styles.moreItemsTextSmall}>他{categoryBreakdown.length - 3}項目</Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* カテゴリ別支出リスト（Webバージョンと同じ） */}
      {categoryBreakdown.length > 0 && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>カテゴリ別支出</Text>
          </View>
          <View style={styles.categoryDetailsList}>
            {categoryBreakdown.map((category, index) => (
              <View key={category.name}>
                <View style={styles.categoryDetailItem}>
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryIcon, { backgroundColor: getCategoryBackgroundColor(category.name) }]}>
                      <Ionicons 
                        name={getCategoryIcon(category.icon)} 
                        size={16} 
                        color={category.color}
                      />
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={styles.categoryAmount}>¥{category.amount.toLocaleString()}</Text>
                  </View>
                </View>
                {index < categoryBreakdown.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
      )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.gray[50], // Webバージョンと同じ背景色
  },
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50], // Webバージョンと同じ背景色
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
  },
  
  // メイン予算ステータスカード（元のWebアプリのデザイン）
  budgetCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    fontFamily: Fonts.medium,
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
    fontFamily: Fonts.bold,
    marginBottom: 4,
  },
  remainingLabel: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
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
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.gray[200],
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
    color: Colors.gray[500],
  },
  savingsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.zaimBlue[400],
  },
  savingsNote: {
    backgroundColor: Colors.gray[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  savingsNoteText: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  
  // 横並びコンテナ
  horizontalContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  halfWidthCard: {
    flex: 1,
    marginHorizontal: 0,
    marginBottom: 0,
  },
  // セクションカード
  sectionCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    backgroundColor: Colors.gray[50],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Fonts.medium,
    color: Colors.black,
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
    fontFamily: Fonts.medium,
    color: Colors.black,
  },
  moreItemsText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.gray[400],
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  incomeExpenseAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    color: Colors.black,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
  },
  
  // ドーナツチャートエリア（Web版と同じ）
  donutChartContainer: {
    padding: 16,
  },
  donutChartSection: {
    alignItems: 'center',
  },
  donutChartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  donutChartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  donutChartAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    color: Colors.black,
  },
  donutChartLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.gray[600],
    marginTop: 2,
  },
  donutChartAmountSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    color: Colors.black,
  },
  donutChartLabelSmall: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.gray[600],
    marginTop: 2,
  },
  donutChartLegend: {
    gap: 8,
    alignItems: 'center',
  },
  donutLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  donutLegendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  donutLegendText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: Fonts.medium,
    color: Colors.black,
  },
  donutLegendPercent: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.gray[600],
  },
  donutChartLegendCompact: {
    gap: 4,
    alignItems: 'center',
  },
  donutLegendItemCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  donutLegendColorSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  donutLegendTextSmall: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: Fonts.medium,
    color: Colors.black,
  },
  donutLegendPercentSmall: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.gray[600],
  },
  moreItemsTextSmall: {
    fontSize: 9,
    fontFamily: Fonts.regular,
    color: Colors.gray[400],
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 2,
  },
  
  // カテゴリ詳細リスト（統合版）
  categoryDetailsList: {
    padding: 0,
  },
  categoryDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: Fonts.medium,
    color: Colors.black,
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    color: Colors.black,
  },
  categoryPercentage: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
    marginTop: 2,
  },
  
  // エンプティステート
  emptyState: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.gray[500],
  },
});