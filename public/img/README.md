# img/

Works セクションのプロダクトカードに表示するスクリーンショット置き場。

## ファイル名（カードと対応）

| ファイル名 | カード | 状態 |
|-----------|--------|------|
| `gekokujo.png`           | 下克上オンライン | ✅ 配置済み |
| `wasurenagusa.png`       | Wasurenagusa | 未配置 |
| `editor-spotlighter.png` | its-demo-issho | 未配置 |
| `ai-tori-lingual.png`    | AIとりリンガル | ✅ 配置済み |
| `mierukun.png`           | AI Agent 見える君 | ✅ 配置済み |
| `basketball-video.png`   | バスケ動画解析 | 未配置 |
| `basketball-scoring.png` | バスケスコアリング（仮） | 未配置 |

## 仕様

- 横長 **16:9 推奨**（例: 1280×720 / 1600×900）。カード幅に合わせて表示され、`object-fit: cover` で中央を切り取る。
- 形式は png / jpg / webp。**png 以外を使う場合は `index.html` の該当 `src` の拡張子も合わせて変える**こと。
- 上記ファイル名で `public/img/` に置けば自動で反映される。
- 画像が無いカードは、薄いプレースホルダ枠が表示される（壊れアイコンは出ない）。
- **モーダルのスライドショー**: カードをクリックして開くモーダルでは、カード画像（例 `gekokujo.png`）に続けて `gekokujo-2.png` `gekokujo-3.png` … と連番で置いた分を、クロスフェードで自動切替＋ドット表示する（1枚だけなら静止、2枚以上で自動再生）。カードのサムネイルは1枚のまま。モーダルがあるのはWhy/What/Howを載せた6プロダクト（下克上・とりリンガル・見える君・Wasurenagusa・its-demo-issho・バスケ動画解析）。
- ファイル名を変えたい場合は言ってくれれば `index.html` の `src` と合わせて直す。

## 差し替え手順

1. このディレクトリにファイル名どおりに画像を置く
2. リポジトリ直下で `firebase deploy --only hosting`
