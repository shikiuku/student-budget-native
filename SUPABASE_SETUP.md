# Supabaseセットアップ手順

## 1. データベーススキーマの適用

1. [Supabaseダッシュボード](https://supabase.com/dashboard)にログイン
2. プロジェクト `student-budget-tracker` を選択
3. 左メニューから **SQL Editor** をクリック
4. 新しいクエリを作成
5. `/database/schema.sql` の内容を全てコピー＆ペースト
6. **Run** ボタンをクリック

## 2. Google認証の設定

1. **Authentication** > **Providers** に移動
2. **Google** を有効化
3. Google Cloud Consoleで取得した以下を入力：
   - Client ID
   - Client Secret
4. **Authorized redirect URIs** に以下を追加：
   ```
   https://hvxyvrquvszdwmjoycsj.supabase.co/auth/v1/callback
   ```

## 3. 確認事項

- [ ] テーブルが作成されたか確認（Table Editor）
- [ ] デフォルトカテゴリが追加されたか確認
- [ ] RLSポリシーが有効になっているか確認

## トラブルシューティング

### スキーマ適用でエラーが出る場合
1. 4行目の `ALTER DATABASE` 行を削除して再実行
2. 既にテーブルが存在する場合は、最初に以下を実行：
   ```sql
   DROP TABLE IF EXISTS public.csv_imports CASCADE;
   DROP TABLE IF EXISTS public.budget_settings CASCADE;
   DROP TABLE IF EXISTS public.expenses CASCADE;
   DROP TABLE IF EXISTS public.expense_categories CASCADE;
   DROP TABLE IF EXISTS public.user_profiles CASCADE;
   ```