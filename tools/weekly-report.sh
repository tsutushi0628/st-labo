#!/bin/bash
# 週1の手元レポート: 未掲載の note・登壇と GA4 の数字を reports/weekly-YYYYMMDD.md にまとめ、Mac の通知で知らせる。
#   bash tools/weekly-report.sh
set -euo pipefail

cd "$(dirname "$0")/.."
# cron は PATH が最小なので、node（nvm）と gcloud の場所を足す
export PATH="$HOME/.nvm/versions/node/v22.23.2/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
mkdir -p reports
out="reports/weekly-$(date +%Y%m%d).md"

{
  echo "# st-labo 週次レポート $(date +%Y-%m-%d)"
  echo
  node tools/check-updates.mjs || echo "（未掲載チェックに失敗）"
  echo
  node tools/ga-report.mjs || echo "（GA4 の取得に失敗）"
} > "$out" 2>&1

count=$(grep -oE '^NEW_COUNT=[0-9]+$' "$out" | cut -d= -f2 || true)
visitors=$(grep -oE '^- 来た人: [0-9]+' "$out" | grep -oE '[0-9]+$' || true)
osascript -e "display notification \"未掲載 ${count:-?}件・来た人 ${visitors:-?}人（直近7日）\" with title \"st-labo 週次レポート\"" || true
echo "$out"
