# データベースマイグレーション実行ガイド

## 概要
学生向け節約アプリのデータベーステーブルを作成するためのマイグレーション手順です。

## 対象テーブル
1. **posts** - 節約投稿テーブル
2. **post_likes** - いいねテーブル
3. **post_bookmarks** - ブックマークテーブル  
4. **post_comments** - コメントテーブル

## 実行方法

### 手順1: Supabase SQL Editorにアクセス
1. ブラウザで以下のURLを開いてください：
   ```
   https://supabase.com/dashboard/project/hvxyvrquvszdwmjoycsj/sql
   ```

### 手順2: SQLファイルを実行
1. `migration-commands.sql` ファイルの内容をコピー
2. Supabase SQL Editorに貼り付け
3. 「Run」ボタンをクリックして実行

### 手順3: 実行確認
実行後、以下のコマンドでテーブルが正常に作成されたことを確認してください：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('posts', 'post_likes', 'post_bookmarks', 'post_comments');
```

### 手順4: テーブル構造確認
各テーブルの構造を確認：

```sql
-- 投稿テーブル
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'posts'
ORDER BY ordinal_position;

-- いいねテーブル
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'post_likes'
ORDER BY ordinal_position;

-- ブックマークテーブル
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'post_bookmarks'
ORDER BY ordinal_position;

-- コメントテーブル
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'post_comments'
ORDER BY ordinal_position;
```

## 注意事項
- この操作には管理者権限が必要です
- 実行前に既存のデータベース状況を確認してください
- エラーが発生した場合は、エラーメッセージを確認して対処してください

## トラブルシューティング
- テーブルが既に存在する場合：`DROP TABLE IF EXISTS table_name CASCADE;` で削除してから再作成
- 権限エラーが発生する場合：Supabaseプロジェクトの管理者権限を確認
- RLSポリシーエラーが発生する場合：既存のポリシーを確認して重複を避ける

## 完了後の確認
マイグレーション完了後、アプリケーションで以下の機能が正常に動作することを確認してください：
- 投稿の作成・表示
- いいね機能
- ブックマーク機能
- コメント機能