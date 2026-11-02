import { Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { A, Footer, PostList, useTitle } from './components.jsx';
import { posts, postsByYear } from './content.js';
import { Markdown } from './markdown.jsx';

export function Post() {
  const { slug } = useParams();
  const post = posts.find((item) => item.slug === slug);
  useTitle(post ? `${post.title} — Kota Sugiki` : '見つかりません — Kota Sugiki');
  if (!post) return <Missing />;

  return (
    <>
      <main className="col">
        <article>
          <header className="post-head">
            <div className="post-meta fade" style={{ '--i': 0 }}>
              <time dateTime={post.published}>{post.date}</time>
              {post.tags.map((tag) => <span key={tag}>{tag}</span>)}
              <A className="u" href={post.qiita} target="_blank" rel="noopener">元記事（Qiita）</A>
            </div>
            <h1 className="post-title fade" style={{ '--i': 1 }}>{post.title}</h1>
          </header>
          <div className="prose fade" style={{ '--i': 2 }}>
            <Markdown source={post.body} />
          </div>
          <div className="post-foot fade" style={{ '--i': 3 }}>
            <A className="u" href="/writing">← 文章の一覧</A>
            <A className="u" href={post.qiita} target="_blank" rel="noopener">Qiitaで読む →</A>
          </div>
        </article>
      </main>
      <Footer i={4} />
    </>
  );
}

export function Home() {
  useTitle('Kota Sugiki');
  return (
    <>
      <main className="col">
        <h1 className="name fade" style={{ '--i': 0 }}>杉木 航太</h1>
        <div className="line fade" style={{ '--i': 1 }}>
          <span className="seal">杉</span>
          <span className="roman">Kōta Sugiki</span>
        </div>
        <p className="intro fade" style={{ '--i': 2 }}>
          ローカルLLMの環境構築と、機械学習の基盤まわりを<br />
          仕事にしているソフトウェアエンジニアです。<br />
          手元のGPUで動かしてみて、<br />
          わかったことを静かに書き留めています。
        </p>
        <section className="fade" style={{ '--i': 3 }}>
          <h2 className="label">Recent writing</h2>
          <PostList posts={posts.slice(0, 4)} />
          <A className="more u" href="/writing">すべての文章を読む →</A>
        </section>
      </main>
      <Footer i={4} />
    </>
  );
}

export function Writing() {
  useTitle('文章 — Kota Sugiki');
  const groups = postsByYear();
  return (
    <>
      <main className="col">
        <h1 className="page-title fade" style={{ '--i': 0 }}>文章</h1>
        <p className="lead fade" style={{ '--i': 1 }}>
          ローカルLLMを手元で動かすための環境構築や、試してみてわかったことの記録です。
        </p>
        {groups.map(([year, items], index) => (
          <Fragment key={year}>
            <h2 className="year fade" style={{ '--i': 2 + index * 2 }}>{year}</h2>
            <div className="fade" style={{ '--i': 3 + index * 2 }}>
              <PostList posts={items} showTags />
            </div>
          </Fragment>
        ))}
      </main>
      <Footer i={2 + groups.length * 2} />
    </>
  );
}

export function About() {
  useTitle('自己紹介 — Kota Sugiki');
  return (
    <>
      <main className="col">
        <h1 className="page-title fade" style={{ '--i': 0 }}>自己紹介</h1>
        <div className="line fade" style={{ '--i': 1 }}>
          <span className="seal">杉</span>
          <span className="roman">Kōta Sugiki</span>
        </div>
        <div className="prose fade" style={{ '--i': 2 }}>
          <p>杉木航太です。東京で、ローカルLLMの環境構築と機械学習の基盤まわりを担当するソフトウェアエンジニアをしています。</p>
          <p>クラウドに頼らず、手元のマシンでモデルを気持ちよく動かすことに興味があります。試してみてわかったことを、このサイトに書いています。</p>
          <p>うまくいった話だけでなく、遠回りした記録も残すようにしています。どこかの誰かの検証時間が少しでも減れば嬉しいです。</p>
        </div>
        <h2 className="label fade" style={{ '--i': 3, marginTop: 40 }}>Profile</h2>
        <dl className="facts fade" style={{ '--i': 4 }}>
          <dt>Focus</dt>
          <dd>ローカルLLMの推論環境、量子化、ML基盤</dd>
          <dt>Tools</dt>
          <dd>llama.cpp / Ollama / vLLM / MLX / Docker</dd>
          <dt>Location</dt>
          <dd>東京（JST）</dd>
          <dt>Now</dt>
          <dd>自宅の推論サーバーを静かに作り直しています。</dd>
        </dl>
        <h2 className="label fade" style={{ '--i': 5 }}>Elsewhere</h2>
        <ul className="links-list fade" style={{ '--i': 6 }}>
          <li><A className="u" href="https://github.com/KotaSugiki" target="_blank" rel="noopener">GitHub</A></li>
          <li><A className="u" href="https://x.com/" target="_blank" rel="noopener">X</A></li>
          <li><A className="u" href="/rss.xml">RSS</A></li>
          <li><A className="u" href="mailto:sgk5utaa@gmail.com">sgk5utaa@gmail.com</A></li>
        </ul>
      </main>
      <Footer i={7} />
    </>
  );
}

export function Missing() {
  useTitle('見つかりません — Kota Sugiki');
  return (
    <>
      <main className="col">
        <h1 className="page-title fade" style={{ '--i': 0 }}>見つかりません</h1>
        <p className="lead fade" style={{ '--i': 1 }}>このページはありません。</p>
        <A className="more u fade" href="/" style={{ '--i': 2 }}>← トップへ</A>
      </main>
      <Footer i={3} />
    </>
  );
}
