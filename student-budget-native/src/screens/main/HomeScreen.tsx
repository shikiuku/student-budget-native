import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

interface UserProfile {
  id: string;
  user_id: string;
  monthly_budget: number;
  savings_goal: number;
  savings_balance: number;
  created_at: string;
  updated_at: string;
}

interface Expense {
  id: string;
  amount: number;
  category_id: string;
  created_at: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // ユーザープロファイルを取得
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profile);

      // 今月の支出を計算
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user!.id)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      if (expensesError) throw expensesError;

      const total = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
      setMonthlyExpenses(total);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const budgetProgress = userProfile 
    ? (monthlyExpenses / userProfile.monthly_budget) * 100 
    : 0;
  const savingsProgress = userProfile 
    ? (userProfile.savings_balance / userProfile.savings_goal) * 100 
    : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>こんにちは！</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('ja-JP')}</Text>
      </View>

      {/* 予算ステータス */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>今月の予算</Text>
          <Ionicons name="wallet-outline" size={24} color="#10B981" />
        </View>
        <Text style={styles.amount}>
          ¥{monthlyExpenses.toLocaleString()} / ¥{userProfile?.monthly_budget.toLocaleString() || 0}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min(budgetProgress, 100)}%` },
              budgetProgress > 80 && styles.progressWarning,
              budgetProgress > 100 && styles.progressDanger,
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {budgetProgress > 100 
            ? `予算を¥${(monthlyExpenses - (userProfile?.monthly_budget || 0)).toLocaleString()}超過しています` 
            : `残り¥${((userProfile?.monthly_budget || 0) - monthlyExpenses).toLocaleString()}`}
        </Text>
      </View>

      {/* 貯金目標 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>貯金目標</Text>
          <Ionicons name="trending-up-outline" size={24} color="#10B981" />
        </View>
        <Text style={styles.amount}>
          ¥{userProfile?.savings_balance.toLocaleString() || 0} / ¥{userProfile?.savings_goal.toLocaleString() || 0}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min(savingsProgress, 100)}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          達成率: {savingsProgress.toFixed(1)}%
        </Text>
      </View>

      {/* クイックアクション */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="add-circle-outline" size={28} color="#10B981" />
          <Text style={styles.actionText}>支出追加</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="stats-chart-outline" size={28} color="#10B981" />
          <Text style={styles.actionText}>レポート</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bulb-outline" size={28} color="#10B981" />
          <Text style={styles.actionText}>節約術</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressWarning: {
    backgroundColor: '#F59E0B',
  },
  progressDanger: {
    backgroundColor: '#EF4444',
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
});