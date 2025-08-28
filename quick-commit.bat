@echo off
echo ========================================
echo 高速コミット・プッシュ
echo ========================================

rem 現在の日時を取得してデフォルトメッセージを作成
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "datestamp=%YYYY%-%MM%-%DD% %HH%:%Min%"

set default_msg=update: %datestamp% 定期更新

echo 自動生成メッセージ: %default_msg%
echo.

rem git操作実行
echo ファイルをステージング中...
git add .

echo コミット中...
git commit -m "%default_msg%

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo プッシュ中...
git push origin main

echo.
echo ========================================
echo 完了！ %datestamp% にコミットされました
echo ========================================
pause