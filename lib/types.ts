// Database types for the student budget tracker app

export type SchoolType = 'middle_school' | 'high_school' | 'vocational_school' | 'university';
export type ExpenseSource = 'manual' | 'paypay_csv' | 'bank_csv';
export type ImportSourceType = 'paypay' | 'bank';

export interface UserProfile {
  id: string;
  name?: string;
  age?: number;
  school_type?: SchoolType;
  prefecture?: string;
  city?: string;
  school_name?: string;
  grade?: string;
  monthly_budget?: number;
  savings_balance?: number;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category_id: string;
  description?: string;
  date: string;
  source: ExpenseSource;
  original_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Relations
  category?: ExpenseCategory;
}

export interface BudgetSetting {
  id: string;
  user_id: string;
  category_id: string;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
  // Relations
  category?: ExpenseCategory;
}

export interface CsvImport {
  id: string;
  user_id: string;
  filename: string;
  source_type: ImportSourceType;
  total_records: number;
  successful_imports: number;
  failed_imports: number;
  import_date: string;
  errors?: Record<string, any>;
}

// PayPay CSV structure
export interface PayPayCsvRecord {
  date: string;
  time: string;
  description: string;
  amount: number;
  balance: number;
  transaction_type: 'payment' | 'charge' | 'refund';
  merchant?: string;
  category?: string;
}

// Form types
export interface UserOnboardingForm {
  name: string;
  age: number;
  school_type: SchoolType;
  prefecture: string;
  city: string;
  school_name: string;
  grade: string;
  monthly_budget: number;
}

export interface ExpenseForm {
  amount: string;
  category_id: string;
  description: string;
  date: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface ExpenseWithCategory extends Expense {
  category: ExpenseCategory;
}

export interface MonthlyExpenseSummary {
  total: number;
  by_category: {
    category_id: string;
    category_name: string;
    amount: number;
    percentage: number;
  }[];
}

// Authentication types
export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}

// Utility types
export type CreateUserProfile = Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
export type UpdateUserProfile = Partial<CreateUserProfile>;
export type CreateExpense = Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdateExpense = Partial<CreateExpense>;
export type CreateBudgetSetting = Omit<BudgetSetting, 'id' | 'user_id' | 'created_at' | 'updated_at'>;