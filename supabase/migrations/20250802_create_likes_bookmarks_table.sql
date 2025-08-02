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