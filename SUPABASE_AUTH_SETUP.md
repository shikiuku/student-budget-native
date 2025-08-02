# Supabase Google認証設定ガイド

## 重要：認証リダイレクトURLの設定

### Supabaseダッシュボードで設定が必要なURL

1. [Supabaseダッシュボード - URL Configuration](https://supabase.com/dashboard/project/hvxyvrquvszdwmjoycsj/auth/url-configuration)にアクセス

2. **Redirect URLs**セクションに以下のURLをすべて追加：

```
http://localhost:3000/auth/callback
https://student-savings-app.vercel.app/auth/callback
https://student-savings-app-*.vercel.app/auth/callback
https://student-budget-tracker.vercel.app/auth/callback
https://student-budget-tracker-*.vercel.app/auth/callback
```

**重要**: Vercelの実際のデプロイURLを確認して追加してください。

### Google Cloud Consoleでの設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. OAuth 2.0 クライアントIDの設定を開く
3. **承認済みのリダイレクト URI**に以下を追加：

```
https://hvxyvrquvszdwmjoycsj.supabase.co/auth/v1/callback
```

### 確認事項

- Supabaseプロジェクトの**Authentication > Providers > Google**が有効になっているか
- Client IDとClient Secretが正しく設定されているか
- Redirect URLsが正しく設定されているか

### トラブルシューティング

#### 「localhost で接続が拒否されました」エラーが出る場合

1. Supabaseダッシュボードの**Redirect URLs**に本番環境のURLが追加されているか確認
2. Vercelの実際のデプロイURLを確認して追加
3. ワイルドカードURL（`https://*.vercel.app/auth/callback`）を追加

#### iPadやモバイルデバイスでの問題

- SafariやChromeの設定でポップアップブロッカーが有効になっていないか確認
- プライベートブラウジングモードでない通常モードで試す