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