-- 節約投稿テーブルの作成
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('食費', '交通費', '娯楽', '学用品', '衣類', 'その他')),
  savings_effect TEXT, -- 節約効果（例: "月3,000円"）
  savings_amount INTEGER, -- 節約額（数値）
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE, -- おすすめ投稿フラグ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 投稿の読み取りポリシー（認証済みユーザーは全ての投稿を閲覧可能）
CREATE POLICY "Anyone can read posts" ON public.posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- 投稿の作成ポリシー（自分の投稿のみ作成可能）
CREATE POLICY "Users can create their own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 投稿の更新ポリシー（自分の投稿のみ更新可能）
CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

-- 投稿の削除ポリシー（自分の投稿のみ削除可能）
CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- インデックス作成
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_category ON public.posts(category);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_featured ON public.posts(is_featured, created_at DESC);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();