-- Student Budget Tracker Database Schema

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table extension (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  age INTEGER,
  school_type TEXT CHECK (school_type IN ('middle_school', 'high_school', 'vocational_school', 'university')),
  prefecture TEXT,
  school_name TEXT,
  grade TEXT,
  monthly_budget INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense categories table
CREATE TABLE public.expense_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.expense_categories (name, icon, color) VALUES
  ('食費', 'Utensils', '#f97316'),
  ('交通費', 'Car', '#3b82f6'),
  ('娯楽', 'ShoppingBag', '#a855f7'),
  ('学用品', 'BookOpen', '#22c55e'),
  ('衣類', 'Shirt', '#ec4899'),
  ('その他', 'Home', '#6b7280');

-- Expenses table
CREATE TABLE public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  category_id UUID REFERENCES public.expense_categories(id) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'paypay_csv', 'bank_csv')),
  original_data JSONB, -- Store original CSV data for reference
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget settings table
CREATE TABLE public.budget_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.expense_categories(id) NOT NULL,
  monthly_limit INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- CSV import logs table
CREATE TABLE public.csv_imports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('paypay', 'bank')),
  total_records INTEGER NOT NULL,
  successful_imports INTEGER NOT NULL,
  failed_imports INTEGER NOT NULL,
  import_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  errors JSONB -- Store any import errors
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csv_imports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- User profiles: users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Expenses: users can only see/edit their own expenses
CREATE POLICY "Users can view own expenses" ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON public.expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON public.expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Budget settings: users can only see/edit their own budget settings
CREATE POLICY "Users can view own budget settings" ON public.budget_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget settings" ON public.budget_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget settings" ON public.budget_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget settings" ON public.budget_settings
  FOR DELETE USING (auth.uid() = user_id);

-- CSV imports: users can only see their own import logs
CREATE POLICY "Users can view own csv imports" ON public.csv_imports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own csv imports" ON public.csv_imports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Expense categories: readable by all authenticated users
CREATE POLICY "Expense categories are viewable by authenticated users" ON public.expense_categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX idx_expenses_date ON public.expenses(date);
CREATE INDEX idx_expenses_category_id ON public.expenses(category_id);
CREATE INDEX idx_budget_settings_user_id ON public.budget_settings(user_id);
CREATE INDEX idx_csv_imports_user_id ON public.csv_imports(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_settings_updated_at BEFORE UPDATE ON public.budget_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();