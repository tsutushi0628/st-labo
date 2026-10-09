# worklog 2026-10-09 LP 更新（WebDB講演・note新記事）＋更新検知の仕組み

対象: st-labo（public/index.html・sitemap.xml・tools/・.github/workflows/）
本番反映: 未（commit・push・deploy はオーナー y/n 待ち）

## 依頼
- WebDB大阪講演（Frontria）と note 記事の現状を LP に反映
- 適宜更新する仕組み

## やったこと
- Talks 節新設（Works と Reading の間）。.reading カード流用、CSS 変更なし。
  - 事実は公開プログラム頁（db-event.jpn.org/webdbw2026 OS「偽情報対策技術」）だけから取る。日付・会場・講演題・パネル題。
  - デッキ（frontria の /webdb2026/ Basic認証配下）・依頼条件（brief）はリンク・転記しない。
  - `data-talk` = outreach フォルダ名（2026-09_webdb2026-summer-workshop）。
- Reading 先頭に新記事2本: 10/07 バイブコーディング脆弱性、07/14 26上半期炎上まとめ。引用は note API 本文から逐語。
  - 2月の2本（Agent Teams・バイブコーディングのやり方）は前回更新時点で既存＝未掲載のまま。
- About・meta description の肩書き: 「AI活用」→「LegalDesign Lab 副所長」、「Frontria リーガルWGチェア」追記。根拠＝公開プログラム頁の講演者紹介。
- sitemap lastmod → 2026-10-09。.gitignore に .tmp/。

## 更新の仕組み
- tools/check-updates.mjs: note RSS × index.html の href、~/projects/*/outreach/YYYY-MM_* × data-talk を突合、未掲載を列挙。末尾 NEW_COUNT。
  - note は掲載中最新記事より新しいものだけ（古い未選択記事を毎回出さない）。
  - 載せないと決めたもの → tools/check-updates.ignore（URL かフォルダ名）。中身は空、裁定待ち。
  - 掲載は人手（カテゴリ語・引用の判断）。自動挿入しない。
- .github/workflows/check-updates.yml: 週1（月 9:17 JST）note のみ確認 → 未掲載あれば Issue（同題が開いていれば作らない）。push まで動かない。
- 検証: 現状で note 0件。新記事1本・data-talk を削ったコピーで note 1件・登壇2件を検出。

## 残り
- 2026-06_frontria-tech-exchange（Frontria 技術交流会、オンライン）が登壇候補として検知される。載せるか未裁定。
- commit・push・deploy（firebase deploy --only hosting）はオーナー承認待ち。
