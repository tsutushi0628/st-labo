# images/

Works セクションのプロダクトカードに表示するスクリーンショット置き場。

## ファイル名（カードと対応）

| ファイル名 | カード |
|-----------|--------|
| `gekokujo-online.png`    | 下克上オンライン |
| `wasurenagusa.png`       | Wasurenagusa |
| `editor-spotlighter.png` | Editor-spotlighter |
| `ai-torilingual.png`     | AI-torilingual |
| `ai-agent-mieru-kun.png` | AI Agent 見える君 |
| `basketball-video.png`   | バスケ動画解析 |
| `basketball-scoring.png` | バスケスコアリング |

## 仕様

- 横長 **16:9 推奨**（例: 1280×720 / 1600×900）。カード幅に合わせて表示され、`object-fit: cover` で中央を切り取る。
- 形式は png / jpg / webp。**png 以外を使う場合は `index.html` の該当 `src` の拡張子も合わせて変える**こと。
- 上記ファイル名で `public/images/` に置けば自動で反映される。
- 画像が無いカードは、薄いプレースホルダ枠が表示される（壊れアイコンは出ない）。

## 差し替え手順

1. このディレクトリにファイル名どおりに画像を置く
2. リポジトリ直下で `firebase deploy --only hosting`
