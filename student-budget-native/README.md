# 学生向け節約アプリ - React Native版

## 概要
学生向けの節約・家計管理アプリのReact Native版です。Expo Goを使用して開発されています。

## セットアップ

### 前提条件
- Node.js (v16以降)
- npm または yarn
- Expo Go アプリ（iOS/Android）

### インストール
```bash
cd student-budget-native
npm install
```

### 環境変数の設定
`.env.example`をコピーして`.env`を作成し、Supabaseの認証情報を設定してください。

```bash
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 開発サーバーの起動
```bash
npx expo start
```

QRコードが表示されるので、Expo Goアプリでスキャンしてアプリを起動します。

## ビルド

### 開発ビルド
```bash
eas build --platform ios --profile development
```

### プロダクションビルド（App Store用）
```bash
eas build --platform ios --profile production
```

## 機能
- ユーザー認証（メール/パスワード）
- 支出管理
- 予算設定と追跡
- 貯金目標の管理
- 節約術の共有
- 学生向け補助金情報

## プロジェクト構造
```
src/
├── components/     # 再利用可能なコンポーネント
├── contexts/       # React Context（認証など）
├── navigation/     # React Navigationの設定
├── screens/        # 画面コンポーネント
│   ├── auth/      # 認証関連画面
│   └── main/      # メイン画面
├── services/       # 外部サービス（Supabase）
├── styles/         # 共通スタイル
├── types/          # TypeScript型定義
└── utils/          # ユーティリティ関数
```

## トラブルシューティング

### Expo Goでアプリが起動しない
- `npm install`を再実行
- `npx expo start -c`でキャッシュをクリア

### ビルドエラー
- `eas build --clear-cache`でキャッシュをクリア
- node_modulesを削除して再インストール

## リリース

### iOS App Storeへの提出
1. Apple Developer Programに登録
2. App Store Connectでアプリを作成
3. `eas.json`の設定を更新
4. `eas build --platform ios --profile production`でビルド
5. `eas submit --platform ios`で提出