# Posts Table Migration Instructions

## マイグレーション実行方法

Supabase CLIでの自動実行が難しいため、以下の手順で手動実行してください：

### 1. Supabase Dashboard にアクセス
1. https://supabase.com/dashboard にアクセス
2. プロジェクト `hvxyvrquvszdwmjoycsj` を選択
3. 左サイドバーの "SQL Editor" をクリック

### 2. SQL実行
以下のSQLを SQL Editor にコピー&ペーストして実行してください：

```sql
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
```

### 3. 実行確認
SQL実行後、以下を確認してください：

1. **テーブル作成確認**
   - 左サイドバーの "Table Editor" をクリック
   - "posts" テーブルが表示されることを確認

2. **カラム確認**
   - posts テーブル内に以下のカラムがあることを確認：
     - id (UUID, Primary Key)
     - user_id (UUID, Foreign Key)
     - title (Text)
     - content (Text)
     - category (Text with CHECK constraint)
     - savings_effect (Text, nullable)
     - savings_amount (Integer, nullable)
     - likes_count (Integer, default 0)
     - comments_count (Integer, default 0)
     - is_featured (Boolean, default false)
     - created_at (Timestamp with timezone)
     - updated_at (Timestamp with timezone)

3. **RLSポリシー確認**
   - "Authentication" > "Policies" で posts テーブルのポリシーが4つ作成されていることを確認

### 4. エラーが発生した場合
- エラーメッセージを確認して、必要に応じて個別のSQLステートメントを実行
- テーブルが既に存在する場合は `DROP TABLE public.posts CASCADE;` を先に実行

## 作成されるテーブル構造

### posts テーブル
- **目的**: 節約テクニックの投稿を管理
- **セキュリティ**: Row Level Security (RLS) 有効
- **パフォーマンス**: 主要カラムにインデックス設定
- **自動更新**: updated_at カラムは更新時に自動更新

### セキュリティポリシー
1. **読み取り**: 認証済みユーザーは全ての投稿を閲覧可能
2. **作成**: ユーザーは自分の投稿のみ作成可能
3. **更新**: ユーザーは自分の投稿のみ更新可能
4. **削除**: ユーザーは自分の投稿のみ削除可能

### インデックス
- user_id: ユーザー別の投稿検索用
- category: カテゴリ別の投稿検索用  
- created_at: 投稿日時順の並び替え用（降順）
- is_featured + created_at: おすすめ投稿の検索用

## 追加テーブル: いいね・ブックマーク・コメント

### 2. いいね・ブックマークテーブル作成
以下のSQLも実行してください：

```sql
-- いいねテーブルの作成
CREATE TABLE public.post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id) -- ユーザーは同じ投稿に1回だけいいね可能
);

-- ブックマークテーブルの作成
CREATE TABLE public.post_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id) -- ユーザーは同じ投稿を1回だけブックマーク可能
);

-- RLS有効化
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_bookmarks ENABLE ROW LEVEL SECURITY;

-- いいねテーブルのポリシー
CREATE POLICY "Users can view all likes" ON public.post_likes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can like posts" ON public.post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON public.post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ブックマークテーブルのポリシー
CREATE POLICY "Users can view their own bookmarks" ON public.post_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can bookmark posts" ON public.post_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove bookmarks" ON public.post_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- インデックス作成
CREATE INDEX idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX idx_post_bookmarks_user_id ON public.post_bookmarks(user_id);
CREATE INDEX idx_post_bookmarks_post_id ON public.post_bookmarks(post_id);

-- 投稿のいいね数を更新するトリガー関数
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- いいねが追加された場合
    UPDATE public.posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- いいねが削除された場合
    UPDATE public.posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- いいね数更新トリガー
CREATE TRIGGER trigger_update_likes_count 
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();
```

### 3. コメントテーブル作成
さらに以下のSQLも実行してください：

```sql
-- コメントテーブルの作成
CREATE TABLE public.post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE, -- 返信コメント用
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- コメントの読み取りポリシー（認証済みユーザーは全てのコメントを閲覧可能）
CREATE POLICY "Anyone can read comments" ON public.post_comments
  FOR SELECT USING (auth.role() = 'authenticated');

-- コメントの作成ポリシー（自分のコメントのみ作成可能）
CREATE POLICY "Users can create their own comments" ON public.post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- コメントの更新ポリシー（自分のコメントのみ更新可能）
CREATE POLICY "Users can update their own comments" ON public.post_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- コメントの削除ポリシー（自分のコメントのみ削除可能）
CREATE POLICY "Users can delete their own comments" ON public.post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- インデックス作成
CREATE INDEX idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_post_comments_parent_id ON public.post_comments(parent_comment_id);
CREATE INDEX idx_post_comments_created_at ON public.post_comments(created_at);

-- コメント数更新トリガー関数
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- コメントが追加された場合（親コメントのみカウント）
    IF NEW.parent_comment_id IS NULL THEN
      UPDATE public.posts 
      SET comments_count = comments_count + 1 
      WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- コメントが削除された場合（親コメントのみカウント）
    IF OLD.parent_comment_id IS NULL THEN
      UPDATE public.posts 
      SET comments_count = comments_count - 1 
      WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- コメント数更新トリガー
CREATE TRIGGER trigger_update_comments_count 
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- コメント更新日時の自動更新トリガー
CREATE TRIGGER update_post_comments_updated_at BEFORE UPDATE ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 全体のテーブル構造
実行完了後、以下のテーブルが作成されます：
1. **posts** - 節約投稿
2. **post_likes** - いいね記録
3. **post_bookmarks** - ブックマーク記録  
4. **post_comments** - コメント記録

マイグレーション完了後は、このファイルは削除してください。