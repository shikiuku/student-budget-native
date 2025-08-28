@echo off
echo ========================================
echo 機能別コミット・プッシュ
echo ========================================
echo.

echo 機能タイプを選択してください:
echo 1. feat (新機能追加)
echo 2. fix (バグ修正)  
echo 3. update (更新・改善)
echo 4. style (UI/スタイル変更)
echo 5. refactor (リファクタリング)
echo 6. docs (ドキュメント更新)
echo 7. test (テスト追加・修正)

set /p choice="番号を選択 (1-7): "

rem 機能タイプを設定
if "%choice%"=="1" set type=feat
if "%choice%"=="2" set type=fix
if "%choice%"=="3" set type=update
if "%choice%"=="4" set type=style
if "%choice%"=="5" set type=refactor
if "%choice%"=="6" set type=docs
if "%choice%"=="7" set type=test

rem 無効な選択の場合
if not defined type (
    echo 無効な選択です。
    pause
    exit /b
)

echo.
set /p description="%type%の詳細を入力してください: "

rem 詳細が空の場合のデフォルト値
if "%description%"=="" set description=%type%を実施

set commit_message=%type%: %description%

echo.
echo ========================================
echo コミットメッセージ: %commit_message%
echo ========================================

rem 現在の状況を確認
git status --short

echo.
set /p confirm="実行しますか？ (y/n): "
if /i "%confirm%" neq "y" (
    echo キャンセルしました。
    pause
    exit /b
)

echo.
echo ファイルをステージング中...
git add .

echo コミット中...
git commit -m "%commit_message%

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo プッシュ中...
git push origin main

echo.
echo ========================================
echo 完了しました！
echo ========================================
pause