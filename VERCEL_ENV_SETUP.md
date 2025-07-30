# Vercel環境変数設定ガイド

Vercelダッシュボードで以下の環境変数を設定してください：

## Firebase設定

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDqLG4RmCow9xiI6TMDua98eMSNsh3ANwQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=student-savings-app-7439b.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=student-savings-app-7439b
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=student-savings-app-7439b.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=805936651667
NEXT_PUBLIC_FIREBASE_APP_ID=1:805936651667:web:002826b2c1433230571c66
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-9S2CB2MHNV
```

## 設定手順

1. Vercelダッシュボードにログイン
2. プロジェクトの「Settings」タブを開く
3. 「Environment Variables」セクションに移動
4. 上記の各環境変数を追加
5. 「Production」「Preview」「Development」すべての環境にチェック
6. 保存して再デプロイ

## 注意事項

- `NEXT_PUBLIC_`プレフィックスは必須（クライアントサイドで使用するため）
- 環境変数追加後は必ず再デプロイが必要