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

## TODO

- AI-torilingual のリンク先URL確定（`public/index.html` 内の `href="#"` 1箇所）
- 公開後の Open Graph タグ・favicon 追加
- カスタムドメイン `st-labo.app` 紐付け
