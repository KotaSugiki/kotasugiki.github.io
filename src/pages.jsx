import { Fragment, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { A, Footer, PostList, useTitle } from './components.jsx';
import { posts, postsByYear } from './content.js';
import { Markdown } from './markdown.jsx';
import { segmentArticle } from './outline.js';
import { TocAside, TocMobile, useArticleToc } from './toc.jsx';

function SlashList({ items }) {
  return items.map((item, index) => (
    <Fragment key={item}>
      <span className="fact-item">{item}{index < items.length - 1 ? ' /' : ''}</span>
      {index < items.length - 1 ? ' ' : null}
    </Fragment>
  ));
}

export function Post() {
  const { slug } = useParams();
  const post = posts.find((item) => item.slug === slug);
  useTitle(post ? `${post.title} — Kota Sugiki` : '見つかりません — Kota Sugiki');
  if (!post) return <Missing />;
  return <Article post={post} />;
}

function Article({ post }) {
  const segmented = useMemo(() => segmentArticle(post.body), [post.body]);
  const { active, onClick } = useArticleToc(segmented.toc);

  return (
    <>
      <div className="post-stage">
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
            <TocMobile headings={segmented.toc} active={active} onClick={onClick} />
            <div className="prose fade" style={{ '--i': 2 }}>
              <Markdown blocks={segmented.blocks} />
            </div>
            <div className="post-foot fade" style={{ '--i': 3 }}>
              <A className="u" href="/blog">← ブログの一覧</A>
              <A className="u" href={post.qiita} target="_blank" rel="noopener">Qiitaで読む →</A>
            </div>
          </article>
        </main>
        <TocAside headings={segmented.toc} active={active} onClick={onClick} />
      </div>
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
          ローカルLLMの環境構築と、音に関する機械学習を<br />
          仕事にしているソフトウェアエンジニアです。<br />
          個人開発のプロダクト紹介や<br />
          学んだことや日々の日記を書き留めています。
        </p>
        <section className="fade" style={{ '--i': 3 }}>
          <h2 className="label">Recent posts</h2>
          <PostList posts={posts.slice(0, 4)} />
          <A className="more u" href="/blog">ブログをすべて見る →</A>
        </section>
      </main>
      <Footer i={4} />
    </>
  );
}

export function Writing() {
  useTitle('ブログ — Kota Sugiki');
  const groups = postsByYear();
  return (
    <>
      <main className="col">
        <h1 className="page-title fade" style={{ '--i': 0 }}>ブログ</h1>
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
          <p>杉木航太です。三重で、ローカルLLMの環境構築と音に関する機械学習を担当するソフトウェアエンジニアをしています。</p>
          <p>最近では生成AIに関する教育・アウトリーチも行っています。</p>
          <p>エンジニアリング以外のことも含め、試してみてわかったことや日記を、このサイトに書いています。</p>
          <p>うまくいった話だけでなく、遠回りした記録も残すようにしています。どこかの誰かの検証時間が少しでも減れば嬉しいです。</p>
        </div>
        <h2 className="label fade" style={{ '--i': 3, marginTop: 40 }}>English</h2>
        <div className="prose prose-en fade" lang="en" style={{ '--i': 4 }}>
          <p>I'm Kota Sugiki, a software engineer based in Mie, Japan, working on local LLM infrastructure and machine learning for audio.</p>
          <p>Recently, I've also been involved in education and outreach around generative AI.</p>
          <p>On this site, I write about what I've learned by trying things out, including things outside of engineering, along with a personal journal.</p>
          <p>I try to record not only what worked, but also the detours along the way. I'd be glad if it saves someone, somewhere, a little time in their own experiments.</p>
        </div>
        <h2 className="label fade" style={{ '--i': 5, marginTop: 40 }}>Profile</h2>
        <dl className="facts fade" style={{ '--i': 6 }}>
          <dt>Focus</dt>
          <dd>
            <SlashList items={['ローカルLLMの環境構築', 'ML', 'アプリ開発', '生成AIに関する教育', 'マネジメント']} />
          </dd>
          <dt>Tools</dt>
          <dd>
            <SlashList items={['vLLM', 'LiteLLM', 'LM Studio', 'Docker', 'Claude Code', 'Grok Bots', 'Cursor', 'Python', 'PyTorch']} />
          </dd>
          <dt>Location</dt>
          <dd>三重（JST）</dd>
          <dt>Now</dt>
          <dd>個人開発やスキル作成、ブログの更新をしています。</dd>
        </dl>
        <h2 className="label fade" style={{ '--i': 7 }}>Elsewhere</h2>
        <ul className="links-list fade" style={{ '--i': 8 }}>
          <li><A className="u" href="https://github.com/KotaSugiki" target="_blank" rel="noopener">GitHub</A></li>
          <li><A className="u" href="https://x.com/" target="_blank" rel="noopener">X</A></li>
          <li><A className="u" href="/rss.xml">RSS</A></li>
          <li><A className="u" href="mailto:sgk5utaa@gmail.com">sgk5utaa@gmail.com</A></li>
        </ul>
      </main>
      <Footer i={9} />
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
