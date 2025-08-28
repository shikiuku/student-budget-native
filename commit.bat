@echo off
echo ========================================
echo Git自動コミット・プッシュスクリプト
echo ========================================
echo.

rem 現在の状況を確認
echo 現在のGit状況:
git status --short

echo.
echo ========================================

rem ユーザーからコミットメッセージを取得
set /p commit_msg="コミットメッセージを入力してください: "

rem コミットメッセージが空の場合のデフォルト値
if "%commit_msg%"=="" set commit_msg=update: 定期更新

echo.
echo ========================================
echo 実行内容:
echo - git add .
echo - git commit -m "%commit_msg%"
echo - git push origin main
echo ========================================

rem 実行確認
set /p confirm="実行しますか？ (y/n): "
if /i "%confirm%" neq "y" (
    echo キャンセルしました。
    pause
    exit /b
)

echo.
echo ファイルをステージング中...
git add .

echo.
echo コミット中...
git commit -m "%commit_msg%

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo.
echo プッシュ中...
git push origin main

echo.
echo ========================================
echo 完了しました！
echo ========================================
pause