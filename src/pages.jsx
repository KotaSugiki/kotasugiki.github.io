import { Fragment } from 'react';
import { A, Footer, PostList, Pre, useTitle } from './components.jsx';
import { posts, postsByYear } from './content.js';

function Article({ title, date, tag, children, foot }) {
  useTitle(`${title} — Kota Sugiki`);
  return (
    <>
      <main className="col">
        <article>
          <header className="post-head">
            <div className="post-meta fade" style={{ '--i': 0 }}>
              <time>{date}</time>
              <span>{tag}</span>
            </div>
            <h1 className="post-title fade" style={{ '--i': 1 }}>{title}</h1>
          </header>
          <div className="prose fade" style={{ '--i': 2 }}>{children}</div>
          <div className="post-foot fade" style={{ '--i': 3 }}>{foot}</div>
        </article>
      </main>
      <Footer i={4} />
    </>
  );
}

function Llama() {
  return (
    <Article
      title="llama.cpp と Ollama を同じマシンで使い分ける"
      date="2026.10.24"
      tag="推論"
      foot={(
        <>
          <A className="u" href="/writing">← 文章の一覧</A>
          <A className="u" href="/posts/quantize-70b">量子化の選び方 →</A>
        </>
      )}
    >
      <p>手元のマシンでLLMを動かすとき、気軽さでは Ollama、細かい調整では llama.cpp を使うことが多くなりました。ただ、同じGPUで両方を立てるとVRAMの取り合いになりがちです。ここでは、自分がどう使い分けているかをまとめておきます。</p>
      <h2>ざっくりした使い分け</h2>
      <ul>
        <li><strong>Ollama</strong>：試しに触る、エディタや小さなツールから呼ぶ</li>
        <li><strong>llama.cpp（llama-server）</strong>：コンテキスト長やオフロード層数をきっちり決めたいとき</li>
      </ul>
      <p>どちらも OpenAI 互換のAPIを話せるので、クライアント側はエンドポイントを差し替えるだけで済みます。</p>
      <h2>llama-server を立てる</h2>
      <p>GGUF のモデルを指定し、GPU に載せる層数とコンテキスト長を明示します。</p>
      <Pre lines={[
        <span className="c"># 全層をGPUへ、コンテキストは8K、ローカルからのみ受け付ける</span>,
        'llama-server \\',
        '  -m ./models/sample-14b-Q4_K_M.gguf \\',
        '  -ngl 99 -c 8192 \\',
        '  --host 127.0.0.1 --port 8080',
      ]} />
      <h2>Ollama 側の設定</h2>
      <p>Ollama はモデルを一定時間メモリに残すので、llama-server と同居させるときは保持時間と同時ロード数を絞っておくと安心です。</p>
      <Pre lines={[
        'export OLLAMA_HOST=127.0.0.1:11434',
        'export OLLAMA_KEEP_ALIVE=5m',
        'export OLLAMA_MAX_LOADED_MODELS=1',
        'ollama serve',
      ]} />
      <blockquote>
        <p>「両方とも常駐させる」より「使うほうだけ起きている」状態を作るほうが、結局ストレスが少ないと感じています。</p>
      </blockquote>
      <h3>VRAM の様子を見る</h3>
      <p>切り替えのたびに <code>nvidia-smi</code> で空き容量を確かめる癖をつけると、謎のメモリ不足に悩まされにくくなります。</p>
      <Pre lines={['nvidia-smi --query-gpu=memory.used,memory.total --format=csv']} />
      <h2>おわりに</h2>
      <p>道具を一つに絞らなくても、役割を分けてしまえば意外と静かに共存できます。次は vLLM も含めた三者の比較を書くつもりです。</p>
    </Article>
  );
}

const quantRows = [
  ['Q8_0', '約 75GB', '質は高いが、家庭用GPUでは厳しい'],
  ['Q5_K_M', '約 50GB', '余裕があるならここ'],
  ['Q4_K_M', '約 42GB', '多くの人の落としどころ'],
  ['Q3_K_M', '約 34GB', '質の低下を感じはじめる'],
];

function Quantize() {
  return (
    <Article
      title="自宅GPUで70Bクラスを動かすときの量子化の選び方"
      date="2026.10.08"
      tag="量子化"
      foot={(
        <>
          <A className="u" href="/posts/llama-cpp-ollama">← llama.cpp と Ollama</A>
          <A className="u" href="/writing">文章の一覧 →</A>
        </>
      )}
    >
      <p>70Bクラスのモデルを自宅で動かそうとすると、まず悩むのが量子化の種類です。ファイルサイズ、速度、出力の質のどこで折り合いをつけるか、自分なりの考え方を残しておきます。</p>
      <h2>まずはサイズの目安を知る</h2>
      <p>GGUF の量子化ごとのおおよそのファイルサイズです。実際にはモデルによって前後します。</p>
      <table>
        <thead>
          <tr>
            <th>量子化</th>
            <th>サイズの目安</th>
            <th>ひとこと</th>
          </tr>
        </thead>
        <tbody>
          {quantRows.map(([name, size, note]) => (
            <tr key={name}>
              <td><code>{name}</code></td>
              <td>{size}</td>
              <td>{note}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>VRAM に載り切らないとき</h2>
      <p>一部の層だけをGPUに載せ、残りをCPUで処理する方法があります。速度は落ちますが、動かないよりはずっといい。</p>
      <Pre lines={[
        <span className="c"># GPUに載せる層数を減らして様子を見る</span>,
        'llama-cli -m ./models/sample-70b-Q4_K_M.gguf -ngl 40 -c 4096',
      ]} />
      <blockquote>
        <p>数字の大きい量子化を選ぶより、少し小さめのモデルを高めの量子化で動かすほうが満足度が高いこともあります。</p>
      </blockquote>
      <h2>自分の選び方</h2>
      <ol>
        <li>まず Q4_K_M で動かして、速度と質の基準を作る</li>
        <li>気になる用途だけ Q5_K_M と比べる</li>
        <li>それでも足りなければ、モデルの大きさ自体を見直す</li>
      </ol>
      <p>結局は、自分のタスクで比べてみるのがいちばんの近道でした。</p>
    </Article>
  );
}

export function Post({ slug }) {
  return slug === 'llama' ? <Llama /> : <Quantize />;
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
          <p>クラウドに頼らず、手元のマシンでモデルを気持ちよく動かすことに興味があります。推論サーバーの立て方、量子化の選び方、GPUとの付き合い方など、試してみてわかったことをこのサイトに書いています。</p>
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
          <li><A className="u" href="https://github.com/" target="_blank" rel="noopener">GitHub</A></li>
          <li><A className="u" href="https://x.com/" target="_blank" rel="noopener">X</A></li>
          <li><A className="u" href="/rss.xml">RSS</A></li>
          <li><A className="u" href="mailto:hello@example.com">Mail</A></li>
        </ul>
      </main>
      <Footer i={7} />
    </>
  );
}

export function Soon() {
  useTitle('準備中 — Kota Sugiki');
  return (
    <>
      <main className="col">
        <h1 className="page-title fade" style={{ '--i': 0 }}>準備中</h1>
        <p className="lead fade" style={{ '--i': 1 }}>この文章はまだ清書中です。もう少しだけお待ちください。</p>
        <A className="more u fade" href="/writing" style={{ '--i': 2 }}>← 文章の一覧へ</A>
      </main>
      <Footer i={3} />
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
