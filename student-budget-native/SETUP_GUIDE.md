# セットアップガイド

## 必要な準備

### 1. 依存関係のインストール
```bash
cd student-budget-native
npm install
```

### 2. アイコンとスプラッシュスクリーンの準備
以下のファイルを用意してください：
- `assets/icon.png` - 1024x1024px のアプリアイコン
- `assets/splash.png` - 1284x2778px のスプラッシュスクリーン
- `assets/adaptive-icon.png` - 1024x1024px のAndroid用アイコン
- `assets/favicon.png` - 48x48px のWeb用アイコン

元のプロジェクトから画像をコピーする場合：
```bash
cp ../public/logo.png ./assets/icon.png
cp ../public/logo.png ./assets/adaptive-icon.png
cp ../public/favicon.ico ./assets/favicon.png
```

### 3. 開発開始
```bash
npx expo start
```

## iOS App Storeへの提出準備

### 1. Apple Developer アカウントの準備
- Apple Developer Program に登録（年間 $99）
- App Store Connect でアプリを作成

### 2. EAS CLIのインストール
```bash
npm install -g eas-cli
eas login
```

### 3. プロジェクトの設定
```bash
eas build:configure
```

### 4. ビルド
```bash
# 開発用ビルド
eas build --platform ios --profile development

# 本番用ビルド
eas build --platform ios --profile production
```

### 5. App Store提出
```bash
eas submit --platform ios
```

## 注意事項

1. **Supabaseの設定**
   - `.env`ファイルに正しいSupabase URLとANON KEYを設定してください
   - メール認証が有効になっていることを確認してください

2. **画像アセット**
   - アプリアイコンは背景を含む正方形の画像を使用してください
   - 透過PNGは避けてください（Appleが自動的に角丸処理を行います）

3. **Bundle Identifier**
   - `app.json`の`ios.bundleIdentifier`を一意の値に変更してください
   - 例: `com.yourcompany.studentbudgettracker`

4. **バージョン管理**
   - 新しいビルドごとに`buildNumber`を増やしてください
   - App Store提出時は`version`も適切に更新してください