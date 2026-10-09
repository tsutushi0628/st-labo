# st-labo

Shintaro TSUKAMOTO — Personal Portfolio LP.

`public/index.html` をそのまま Firebase Hosting で配信するワンページャー。

## 構成

```
st-labo/
├── firebase.json         # Hosting 設定（publicディレクトリ／セキュリティヘッダ）
├── .firebaserc           # default project: st-labo
├── public/
│   └── index.html        # LP本体（単体完結。外部依存ゼロ）
└── README.md
```

## ローカル動作確認

ブラウザで開くだけで全機能動作する（外部依存ゼロ・SVG/CSSはインライン）。

```bash
open public/index.html
```

Firebase エミュレータで本番に近い形で確認する場合：

```bash
firebase emulators:start --only hosting
# http://localhost:5000 で表示
```

## デプロイ

Firebase CLI ログイン（個人アカウント `tsutushi0628@gmail.com` に切替済みであること）：

```bash
firebase login:use tsutushi0628@gmail.com
firebase deploy --only hosting
```

デプロイ後の公開URL: `https://st-labo.web.app` ／ `https://st-labo.firebaseapp.com`

## カスタムドメイン

`st-labo.app` への紐付けは Firebase Console のHosting設定から行う。

## 掲載内容の更新チェック

note の新しい記事と、各プロジェクトの `outreach/YYYY-MM_<slug>/` にある登壇のうち、LP に載っていないものを一覧にする。

```bash
node tools/check-updates.mjs              # note と登壇の両方（手元の Mac で実行）
node tools/check-updates.mjs --note-only  # note だけ
```

- note は、LP に載っている一番新しい記事より後に出たものだけを拾う（昔載せなかった記事は出ない）
- 載せないと決めたものは `tools/check-updates.ignore` に URL かフォルダ名を書くと出なくなる
- 登壇は Talks のカードの `data-talk` 属性にフォルダ名を書くと「掲載済み」になる
- `.github/workflows/check-updates.yml` が毎週月曜に note を確認し、未掲載があれば Issue を立てる
- 掲載するときのカテゴリ語と引用文は、記事本文から人が選ぶ

## TODO

- AI-torilingual のリンク先URL確定（`public/index.html` 内の `href="#"` 1箇所）
- 公開後の Open Graph タグ・favicon 追加
- カスタムドメイン `st-labo.app` 紐付け
