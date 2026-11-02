# 杉木航太 / Kota Sugiki

杉木航太（Kota Sugiki）の個人サイトです。テックブログと自己紹介を、余白の多い静かな日本語のエディトリアルデザインで公開しています。

https://kotasugiki.github.io/

English: a personal site with a tech blog and a short self-introduction, in a quiet, minimal Japanese editorial design.

## 技術構成

- React 19 と Vite 8（`@vitejs/plugin-react`）
- ルーティングは React Router 7 の `BrowserRouter`
- 記事本文は react-markdown と remark-gfm で描画
- スタイルは `src/index.css` のみ。書体は Noto Serif JP、Newsreader、IBM Plex Mono

## ディレクトリ

```
index.html                 エントリ HTML（タイトル、ファビコン、RSS）
vite.config.js             Vite 設定。ビルド時に 404.html を作る
src/
  main.jsx                 React の起動
  App.jsx                  ルート定義
  pages.jsx                トップ、ブログ、自己紹介、記事、404
  components.jsx           ヘッダー、フッター、記事一覧
  content.js               記事のメタデータと本文の読み込み
  markdown.jsx             Markdown の描画
  outline.js               見出し、目次、Qiita 記法の前処理
  toc.jsx                  目次
  index.css                スタイル
  posts/*.md               記事本文
public/
  favicon.svg              ファビコン（ほか favicon.ico、icon-192.png、
  favicon.ico              icon-512.png、apple-touch-icon.png）
  rss.xml                  手書きの RSS
.github/workflows/
  deploy.yml               GitHub Pages への公開
```

## ローカル開発

GitHub Actions は Node.js 22 を使います。`package.json` に `engines` の指定はありません。

```bash
npm ci
npm run dev       # 開発サーバー（vite）
npm run build     # 本番ビルド（vite build）。出力は dist/
npm run preview   # dist/ を http://127.0.0.1:4173 で確認
```

## 記事を追加する

本文にフロントマターはありません。メタデータは `src/content.js` の `posts` 配列で、新しい記事を先頭に置きます。日付とタグは Qiita の `created_at` と tags に合わせています。

`slug` は Qiita の記事 ID です。ルートは `/posts/:slug` なので、公開パスは `/posts/<slug>` になります。

1. 本文を `src/posts/<slug>.md` に置く。
2. `src/content.js` で raw インポートする。

```js
import post from './posts/<slug>.md?raw';
```

3. `posts` の先頭にエントリを足す。

```js
{
  slug: '<slug>',
  date: '2026.10.30',
  published: '2026-10-30T14:22:00+09:00',
  title: 'タイトル',
  tags: ['タグ'],
  href: '/posts/<slug>',
  qiita: 'https://qiita.com/SK5uta/items/<slug>',
  year: '2026',
  body: post,
}
```

`qiita` が記事ページの「元記事（Qiita）」と「Qiitaで読む」のリンクになります。

RSS は自動生成しません。同じ記事を `public/rss.xml` にも追加します。

Qiita の `:::note` と Speaker Deck の埋め込み（`<script class="speakerdeck-embed" data-id="...">`）は、`src/outline.js` が描画前に引用と埋め込みへ変換します。

## ルート

- `/` — トップ（名前、短い紹介、最近の記事）
- `/blog` — ブログ一覧（年ごと）
- `/writing` — `/blog` へリダイレクト
- `/about` — 自己紹介
- `/posts/<slug>` — 記事
- それ以外 — 「見つかりません」

## デプロイ

`main` への push、または workflow の手動実行で `.github/workflows/deploy.yml` が動きます。Node.js 22 で `npm ci` と `npm run build` を実行し、`dist/` を GitHub Pages に公開します。

GitHub Pages は未知のパスで `404.html` を返し、リクエストされた URL はそのまま残します。ビルド時に `vite.config.js` が `dist/index.html` を `dist/404.html` へコピーするので、`/posts/...` への直接アクセスでもクライアント側のルーターがページを出せます。

Pages の Source は GitHub Actions です（Settings → Pages → Build and deployment）。

## ライセンス

[MIT License](LICENSE)（Copyright (c) 2026 KotaSugiki）

## リンク

- [GitHub](https://github.com/KotaSugiki)
- [Qiita](https://qiita.com/SK5uta)
