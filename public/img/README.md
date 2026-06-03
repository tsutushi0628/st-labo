# img/

Works セクションのプロダクトカードに表示するスクリーンショット置き場。

## ファイル名（カードと対応）

| ファイル名 | カード | 状態 |
|-----------|--------|------|
| `gekokujo.png`           | 下克上オンライン | ✅ 配置済み |
| `wasurenagusa.png`       | Wasurenagusa | 未配置 |
| `editor-spotlighter.png` | Editor-spotlighter | 未配置 |
| `torilingual.png`        | AI-torilingual | 未配置 |
| `mierukun.png`           | AI Agent 見える君 | ✅ 配置済み |
| `basketball-video.png`   | バスケ動画解析 | 未配置 |
| `basketball-scoring.png` | バスケスコアリング | 未配置 |

## 仕様

- 横長 **16:9 推奨**（例: 1280×720 / 1600×900）。カード幅に合わせて表示され、`object-fit: cover` で中央を切り取る。
- 形式は png / jpg / webp。**png 以外を使う場合は `index.html` の該当 `src` の拡張子も合わせて変える**こと。
- 上記ファイル名で `public/img/` に置けば自動で反映される。
- 画像が無いカードは、薄いプレースホルダ枠が表示される（壊れアイコンは出ない）。
- ファイル名を変えたい場合は言ってくれれば `index.html` の `src` と合わせて直す。

## 差し替え手順

1. このディレクトリにファイル名どおりに画像を置く
2. リポジトリ直下で `firebase deploy --only hosting`
