# 学生向け節約アプリ - Claude開発記録

## プロジェクト概要
- 学生向けの家計管理・節約アプリ
- Next.js + TypeScript + Tailwind CSS
- 開発サーバー: `npm run dev` でポート3000で起動
- スタイルガイド: http://localhost:3000/styleguide

## 最近の変更内容

### Supabaseへの完全移行 (2025-01-31)
- Supabase MCPサーバーを使用して新プロジェクト「student-budget-tracker」を作成
- @supabase/supabase-jsパッケージをpnpmでインストール完了
- .env.localをFirebaseからSupabase環境変数に更新
- Firebase関連のコードをすべてSupabaseに移行完了
- 開発サーバーが正常に動作（ポート3000、--hostname 0.0.0.0で起動）

### M PLUS Rounded 1cフォント完全適用 (2025-01-31)
- layout.tsxでデフォルトフォントをInterからM PLUS Rounded 1cに変更
- tailwind.config.tsでsansフォントファミリーをM PLUS Rounded 1c優先に設定
- 日本語サブセット対応を強化（latin + latin-ext）
- 全ての日本語テキスト、英語、数字が統一された丸いフォントで表示

### フォント設定の修正 (2025-01-30)
- 日本語に対応した丸いフォントに変更
- M PLUS Rounded 1cフォントを追加
- layout.tsx: M_PLUS_Rounded_1cを追加、フォント変数を設定
- tailwind.config.ts: デフォルトフォントをM PLUS Rounded 1cに変更
- すべてのテキスト（日本語・英語・数字）が統一された丸いフォントで表示される

### スタイルガイドの日本語化
- システムアイコンのテキストを英語から日本語に変更
- app/styleguide/page.tsx: アイコン名を日本語に翻訳
  - TrendingUp → 上昇トレンド
  - Settings → 設定
  - User → ユーザー など

### ファイルクリーンアップ
削除したファイル:
- user_stories.md
- technical_architecture.md
- execution_checklist.md
- CLAUDE_CONTEXT.md
- VERCEL_ENV_SETUP.md
- STYLE_GUIDE.md
- commit_message.txt
- temp_commit_message.txt
- lib/firebase.ts
- package.jsonからfirebase依存関係を削除

## 現在のプロジェクト構成
```
app/
├── api/           # API routes
├── expenses/      # 支出管理ページ
├── paypay/        # PayPay連携ページ
├── styleguide/    # UIスタイルガイド
├── subsidies/     # 補助金情報ページ
├── tips/          # 節約アドバイスページ
└── layout.tsx     # ルートレイアウト

components/
├── ui/            # shadcn/ui コンポーネント
└── [各種コンポーネント]

lib/
├── supabase.ts    # Supabase設定
└── utils.ts       # ユーティリティ関数
```

## 技術スタック
- フレームワーク: Next.js 14.2.15
- 言語: TypeScript
- スタイリング: Tailwind CSS
- UIコンポーネント: shadcn/ui (Radix UI ベース)
- アイコン: Lucide React
- フォント: M PLUS Rounded 1c (日本語対応の丸いフォント)
- データベース: Supabase

## 開発メモ
- 開発サーバーが時々応答しなくなる場合は再起動が必要
- フォント変更後はブラウザリロードが必要
- スタイルガイドページで全UIコンポーネントを確認可能

### Windows環境での開発サーバー起動方法 (2025-08-02)
**現在**: Windows環境で直接開発中

1. **開発サーバー起動**: `npm run dev`
2. **アクセス**: http://localhost:3000
3. **スタイルガイド**: http://localhost:3000/styleguide
4. **注意**: サーバー起動まで約30-40秒かかる場合がある

## 次回作業の候補
- UI/UXの改善
- 新機能の追加
- パフォーマンス最適化
- テスト追加