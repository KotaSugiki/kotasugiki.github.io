import vllm from './posts/f48222cf218c0407cded.md?raw';
import lmstudio from './posts/3340fa82c944849916db.md?raw';
import openslide from './posts/58de799c8d2f0a13463e.md?raw';

// Newest first. Dates and tags come from the Qiita API (created_at / tags).
export const posts = [
  {
    slug: '58de799c8d2f0a13463e',
    date: '2026.10.30',
    published: '2026-10-30T14:22:00+09:00',
    title: 'open-slide：Claude Code / Codex にスライドを React で書かせるフレームワークを試してみた',
    tags: ['生成AI', 'ClaudeCode', 'codex', 'スライド', '初心者エンジニア'],
    href: '/posts/58de799c8d2f0a13463e',
    qiita: 'https://qiita.com/SK5uta/items/58de799c8d2f0a13463e',
    year: '2026',
    body: openslide,
  },
  {
    slug: '3340fa82c944849916db',
    date: '2026.08.25',
    published: '2026-08-25T15:35:03+09:00',
    title: 'LM Studio + Qwen Code + DuckDuckGo MCPでWeb検索を実現する',
    tags: ['LLM', 'Qwen', 'LMStudio', 'MCP', 'ローカルLLM'],
    href: '/posts/3340fa82c944849916db',
    qiita: 'https://qiita.com/SK5uta/items/3340fa82c944849916db',
    year: '2026',
    body: lmstudio,
  },
  {
    slug: 'f48222cf218c0407cded',
    date: '2026.08.20',
    published: '2026-08-20T22:05:56+09:00',
    title: 'vLLM + LiteLLMをWSL/Docker Composeで動かし、Qwen Codeから接続するまで',
    tags: ['vLLM', 'litellm', 'Docker', 'Qwen', 'LLM'],
    href: '/posts/f48222cf218c0407cded',
    qiita: 'https://qiita.com/SK5uta/items/f48222cf218c0407cded',
    year: '2026',
    body: vllm,
  },
];

export function postsByYear() {
  const groups = new Map();
  for (const post of posts) {
    if (!groups.has(post.year)) groups.set(post.year, []);
    groups.get(post.year).push(post);
  }
  return [...groups.entries()];
}
