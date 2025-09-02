import { supabase } from './supabase';
import type {
  UserProfile,
  CreateUserProfile,
  UpdateUserProfile,
  Expense,
  CreateExpense,
  UpdateExpense,
  ExpenseWithCategory,
  BudgetSetting,
  CreateBudgetSetting,
  ExpenseCategory,
  CsvImport,
  MonthlyExpenseSummary,
  ApiResponse
} from './types';

// Helper function to get public URL for storage
const getStoragePublicUrl = (path: string): string => {
  return supabase.storage.from('profile-images').getPublicUrl(path).data.publicUrl;
}

// User Profile operations
export const userProfileService = {
  async getProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  },

  async createProfile(userId: string, profile: CreateUserProfile): Promise<ApiResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({ id: userId, ...profile })
        .select()
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  },

  async updateProfile(userId: string, updates: UpdateUserProfile): Promise<ApiResponse<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  },

  async updateCategoryIcon(userId: string, categoryName: string, iconName: string): Promise<ApiResponse<UserProfile>> {
    try {
      // まず現在のプロファイルを取得
      const currentProfile = await this.getProfile(userId);
      if (!currentProfile.success || !currentProfile.data) {
        throw new Error('プロファイルが見つかりません');
      }

      // category_iconsを更新
      const currentIcons = currentProfile.data.category_icons || {};
      const updatedIcons = { ...currentIcons, [categoryName]: iconName };

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ category_icons: updatedIcons })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  },

  async addToSavings(userId: string, amount: number): Promise<ApiResponse<UserProfile>> {
    try {
      // Get current profile first
      const { data: profile, error: getError } = await supabase
        .from('user_profiles')
        .select('savings_balance')
        .eq('id', userId)
        .single();

      if (getError) throw getError;

      const currentSavings = profile?.savings_balance || 0;
      const newSavingsBalance = currentSavings + amount;

      // Update savings balance
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ savings_balance: newSavingsBalance })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  },

  async uploadAvatar(userId: string, file: File): Promise<ApiResponse<string>> {
    try {
      // ファイル名を生成（ユーザーIDと現在のタイムスタンプ）
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // 既存のアバターを削除
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').slice(-2).join('/');
        await supabase.storage.from('profile-images').remove([oldPath]);
      }

      // 新しいアバターをアップロード
      const { data, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 公開URLを取得
      const publicUrl = getStoragePublicUrl(data.path);

      // プロフィールを更新
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      return { data: publicUrl, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  },

  async deleteAvatar(userId: string): Promise<ApiResponse<null>> {
    try {
      // 現在のアバターURLを取得
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (profile?.avatar_url) {
        // ストレージから削除
        const path = profile.avatar_url.split('/').slice(-2).join('/');
        const { error: deleteError } = await supabase.storage
          .from('profile-images')
          .remove([path]);

        if (deleteError) throw deleteError;
      }

      // プロフィールからURLを削除
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (updateError) throw updateError;

      return { data: null, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }
};

// Expense Categories operations
export const expenseCategoryService = {
  async getCategories(): Promise<ApiResponse<ExpenseCategory[]>> {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name');

      if (error) throw error;

      return { data: data || [], success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  },

  async updateCategoryIcon(categoryId: string, iconName: string): Promise<ApiResponse<ExpenseCategory>> {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .update({ icon: iconName })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }
};

// Expenses operations
export const expenseService = {
  async getExpenses(userId: string, limit?: number): Promise<ApiResponse<ExpenseWithCategory[]>> {
    try {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          category:expense_categories(*)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data: data || [], success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  },

  async getExpensesByMonth(userId: string, year: number, month: number): Promise<ApiResponse<ExpenseWithCategory[]>> {
    try {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          category:expense_categories(*)
        `)
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;

      return { data: data || [], success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  },

  async createExpense(userId: string, expense: CreateExpense): Promise<ApiResponse<Expense>> {
    try {
      // Ensure amount is an integer
      const expenseData = {
        user_id: userId,
        amount: Math.round(expense.amount), // Ensure integer
        category_id: expense.category_id,
        description: expense.description,
        date: expense.date,
        source: expense.source,
        original_data: expense.original_data
      };
      
      console.log('createExpense - データ準備:', expenseData);
      
      const { data, error } = await supabase
        .from('expenses')
        .insert(expenseData)
        .select()
        .single();

      if (error) {
        console.error('createExpense - Supabaseエラー:', error);
        throw error;
      }

      console.log('createExpense - 成功:', data);
      return { data, success: true };
    } catch (error) {
      console.error('createExpense - エラー:', error);
      return { error: (error as Error).message, success: false };
    }
  },

  async updateExpense(expenseId: string, updates: UpdateExpense): Promise<ApiResponse<Expense>> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', expenseId)
        .select()
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  },

  async deleteExpense(expenseId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  },

  async getMonthlyExpenseSummary(userId: string, year: number, month: number): Promise<ApiResponse<MonthlyExpenseSummary>> {
    try {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          amount,
          category:expense_categories(id, name)
        `)
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      const expenses = data || [];
      const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Group by category
      const categoryTotals: Record<string, { name: string; amount: number }> = {};
      expenses.forEach(expense => {
        const category = Array.isArray(expense.category) ? expense.category[0] : expense.category;
        const categoryId = category?.id || 'unknown';
        const categoryName = category?.name || 'Unknown';
        
        if (!categoryTotals[categoryId]) {
          categoryTotals[categoryId] = { name: categoryName, amount: 0 };
        }
        categoryTotals[categoryId].amount += expense.amount;
      });

      const by_category = Object.entries(categoryTotals).map(([category_id, { name, amount }]) => ({
        category_id,
        category_name: name,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0
      }));

      return { 
        data: { total, by_category }, 
        success: true 
      };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }
};

// Budget Goals operations
export const budgetService = {
  async getBudgetGoals(userId: string, year: number, month: number): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('budget_goals')
        .select(`
          *,
          category:expense_categories(*)
        `)
        .eq('user_id', userId)
        .eq('year', year)
        .eq('month', month);

      if (error) throw error;

      return { data: data || [], success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  },

  async upsertBudgetGoal(userId: string, categoryId: string, monthlyLimit: number, year: number, month: number): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('budget_goals')
        .upsert({ 
          user_id: userId, 
          category_id: categoryId, 
          monthly_limit: monthlyLimit,
          year,
          month
        })
        .select()
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  },

  async deleteBudgetGoal(userId: string, categoryId: string, year: number, month: number): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('budget_goals')
        .delete()
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .eq('year', year)
        .eq('month', month);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }
};

// Savings Goals operations
export const savingsService = {
  async getSavingsGoals(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  },

  async createSavingsGoal(userId: string, goal: {
    title: string;
    description?: string;
    target_amount: number;
    target_date?: string;
    icon?: string;
    color?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert({ user_id: userId, ...goal })
        .select()
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  },

  async updateSavingsGoal(goalId: string, updates: {
    title?: string;
    description?: string;
    target_amount?: number;
    current_amount?: number;
    target_date?: string;
    icon?: string;
    color?: string;
    is_completed?: boolean;
  }): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .update(updates)
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  },

  async deleteSavingsGoal(goalId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }
};

// CSV Import operations
export const csvImportService = {
  async createImportLog(userId: string, importData: Omit<CsvImport, 'id' | 'user_id' | 'import_date'>): Promise<ApiResponse<CsvImport>> {
    try {
      const { data, error } = await supabase
        .from('csv_imports')
        .insert({ user_id: userId, ...importData })
        .select()
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  },

  async getImportHistory(userId: string): Promise<ApiResponse<CsvImport[]>> {
    try {
      const { data, error } = await supabase
        .from('csv_imports')
        .select('*')
        .eq('user_id', userId)
        .order('import_date', { ascending: false });

      if (error) throw error;

      return { data: data || [], success: true };
    } catch (error) {
      return { error: (error as Error).message, success: false };
    }
  }
};